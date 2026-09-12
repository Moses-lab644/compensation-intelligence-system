import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Seeding compensation data...");

  const softwareEngineer =
    await prisma.role.upsert({
      where: {
        normalizedName: "software engineer",
      },
      update: {},
      create: {
        name: "Software Engineer",
        normalizedName: "software engineer",
      },
    });

  const l4 = await prisma.level.upsert({
    where: {
      name: "L4",
    },
    update: {},
    create: {
      name: "L4",
    },
  });

  const newYork =
    await prisma.location.upsert({
      where: {
        country_city: {
          country: "United States",
          city: "New York",
        },
      },
      update: {},
      create: {
        country: "United States",
        city: "New York",
      },
    });

  const companies = [
    {
      name: "Google",
      normalizedName: "google",
    },
    {
      name: "Microsoft",
      normalizedName: "microsoft",
    },
    {
      name: "Amazon",
      normalizedName: "amazon",
    },
  ];

  for (const companyData of companies) {
    await prisma.company.upsert({
      where: {
        normalizedName:
          companyData.normalizedName,
      },
      update: {},
      create: companyData,
    });
  }

  const google =
    await prisma.company.findUniqueOrThrow({
      where: {
        normalizedName: "google",
      },
    });

  const microsoft =
    await prisma.company.findUniqueOrThrow({
      where: {
        normalizedName: "microsoft",
      },
    });

  const amazon =
    await prisma.company.findUniqueOrThrow({
      where: {
        normalizedName: "amazon",
      },
    });

  const records = [
    {
      companyId: google.id,
      baseSalary: 150000,
      bonus: 20000,
      stock: 30000,
    },
    {
      companyId: google.id,
      baseSalary: 155000,
      bonus: 20000,
      stock: 30000,
    },
    {
      companyId: microsoft.id,
      baseSalary: 140000,
      bonus: 15000,
      stock: 25000,
    },
    {
      companyId: amazon.id,
      baseSalary: 120000,
      bonus: 0,
      stock: 0,
    },
  ];

  for (const record of records) {
    const totalCompensation =
      record.baseSalary +
      record.bonus +
      record.stock;

    const existing =
      await prisma.compensation.findFirst({
        where: {
          companyId: record.companyId,
          roleId: softwareEngineer.id,
          levelId: l4.id,
          locationId: newYork.id,
          baseSalary: record.baseSalary,
          bonus: record.bonus,
          stock: record.stock,
          currency: "USD",
        },
      });

    if (!existing) {
      await prisma.compensation.create({
        data: {
          companyId: record.companyId,
          roleId: softwareEngineer.id,
          levelId: l4.id,
          locationId: newYork.id,
          baseSalary: record.baseSalary,
          bonus: record.bonus,
          stock: record.stock,
          totalCompensation,
          currency: "USD",
          source: "seed",
        },
      });
    }
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });