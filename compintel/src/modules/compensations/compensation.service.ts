import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import { normalizeName } from "../../utils/normalize.js";

import type { CreateCompensationInput } from "./compensation.schema.js";
import type { GetCompensationsQuery } from "./compensation.query.schema.js";

@Injectable()
export class CompensationService {
constructor(
@Inject(PrismaService)
private readonly prisma: PrismaService,
) {}

async createCompensation(
input: CreateCompensationInput,
) {
const normalizedCompany =
normalizeName(input.company);


const normalizedRole =
  normalizeName(input.role);

const company =
  await this.prisma.company.upsert({
    where: {
      normalizedName: normalizedCompany,
    },
    update: {},
    create: {
      name: input.company.trim(),
      normalizedName: normalizedCompany,
    },
  });

const role =
  await this.prisma.role.upsert({
    where: {
      normalizedName: normalizedRole,
    },
    update: {},
    create: {
      name: input.role.trim(),
      normalizedName: normalizedRole,
    },
  });

const level =
  await this.prisma.level.upsert({
    where: {
      name: input.level.trim(),
    },
    update: {},
    create: {
      name: input.level.trim(),
    },
  });

const location =
  await this.prisma.location.upsert({
    where: {
      country_city: {
        country: input.country.trim(),
        city: input.city.trim(),
      },
    },
    update: {},
    create: {
      country: input.country.trim(),
      city: input.city.trim(),
    },
  });

const bonus = input.bonus ?? 0;
const stock = input.stock ?? 0;

const totalCompensation =
  input.baseSalary + bonus + stock;

const existingCompensation =
  await this.prisma.compensation.findFirst({
    where: {
      companyId: company.id,
      roleId: role.id,
      levelId: level.id,
      locationId: location.id,
      baseSalary: input.baseSalary,
      bonus,
      stock,
      currency: input.currency,
    },
  });

if (existingCompensation) {
  throw new Error(
    "An identical compensation record already exists",
  );
}

return this.prisma.compensation.create({
  data: {
    companyId: company.id,
    roleId: role.id,
    levelId: level.id,
    locationId: location.id,
    baseSalary: input.baseSalary,
    bonus,
    stock,
    totalCompensation,
    currency: input.currency,
    source: input.source,
  },
  include: {
    company: true,
    role: true,
    level: true,
    location: true,
  },
});


}

async compareCompensation(
filters: GetCompensationsQuery,
) {
const {
companies,
role,
level,
country,
city,
currency,
} = filters;


if (!companies) {
  throw new Error(
    "At least one company is required for comparison",
  );
}

const companyNames = companies
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);

if (companyNames.length === 0) {
  throw new Error(
    "At least one company is required for comparison",
  );
}

const normalizedCompanies =
  companyNames.map(normalizeName);

const where = {
  company: {
    normalizedName: {
      in: normalizedCompanies,
    },
  },

  ...(role && {
    role: {
      normalizedName: normalizeName(role),
    },
  }),

  ...(level && {
    level: {
      name: level,
    },
  }),

  ...(country || city
    ? {
        location: {
          ...(country && {
            country: {
              equals: country,
              mode: "insensitive" as const,
            },
          }),

          ...(city && {
            city: {
              equals: city,
              mode: "insensitive" as const,
            },
          }),
        },
      }
    : {}),

  ...(currency && {
    currency,
  }),
};

const compensations =
  await this.prisma.compensation.findMany({
    where,
    include: {
      company: true,
      role: true,
      level: true,
      location: true,
    },
  });

const companyMap = new Map<
  string,
  {
    company: string;
    records: number;
    totalCompensation: number;
  }
>();

for (const compensation of compensations) {
  const companyName =
    compensation.company.name;

  const existing =
    companyMap.get(companyName);

  if (existing) {
    existing.records += 1;

    existing.totalCompensation += Number(
      compensation.totalCompensation,
    );
  } else {
    companyMap.set(companyName, {
      company: companyName,
      records: 1,
      totalCompensation: Number(
        compensation.totalCompensation,
      ),
    });
  }
}

const comparison = Array.from(
  companyMap.values(),
)
  .map((item) => ({
    company: item.company,
    records: item.records,
    averageTotalCompensation:
      item.totalCompensation /
      item.records,
  }))
  .sort(
    (a, b) =>
      b.averageTotalCompensation -
      a.averageTotalCompensation,
  );

return {
  criteria: {
    companies: companyNames,
    role: role ?? null,
    level: level ?? null,
    country: country ?? null,
    city: city ?? null,
    currency: currency ?? null,
  },
  companies: comparison,
};

}

async getCompensations(
filters: GetCompensationsQuery,
) {
const {
company,
role,
level,
country,
city,
currency,
page,
limit,
} = filters;


const skip = (page - 1) * limit;

const where = {
  ...(company && {
    company: {
      normalizedName: normalizeName(company),
    },
  }),

  ...(role && {
    role: {
      normalizedName: normalizeName(role),
    },
  }),

  ...(level && {
    level: {
      name: level,
    },
  }),

  ...(country || city
    ? {
        location: {
          ...(country && {
            country: {
              equals: country,
              mode: "insensitive" as const,
            },
          }),

          ...(city && {
            city: {
              equals: city,
              mode: "insensitive" as const,
            },
          }),
        },
      }
    : {}),

  ...(currency && {
    currency,
  }),
};

const [
  compensations,
  total,
] = await Promise.all([
  this.prisma.compensation.findMany({
    where,
    include: {
      company: true,
      role: true,
      level: true,
      location: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  }),

  this.prisma.compensation.count({
    where,
  }),
]);

return {
  data: compensations,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(
      total / limit,
    ),
  },
};


}
}
