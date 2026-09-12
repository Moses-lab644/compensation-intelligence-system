import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { normalizeName } from "../../utils/normalize.js";

@Injectable()
export class CompanyService {
  constructor(
  @Inject(PrismaService)
  private readonly prisma: PrismaService,
) {}

  async getCompanySummary(companyName: string) {
    const normalizedCompany = normalizeName(companyName);

    const company = await this.prisma.company.findUnique({
      where: {
        normalizedName: normalizedCompany,
      },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    const compensations =
      await this.prisma.compensation.findMany({
        where: {
          companyId: company.id,
        },
        include: {
          role: true,
          level: true,
          location: true,
        },
      });

    if (compensations.length === 0) {
      return {
        company: company.name,
        totalRecords: 0,
        averages: {
          baseSalary: 0,
          bonus: 0,
          stock: 0,
          totalCompensation: 0,
        },
        byLevel: [],
      };
    }

    const sum = (values: number[]) =>
      values.reduce(
        (total, value) => total + value,
        0,
      );

    const baseSalaries = compensations.map((item) =>
      Number(item.baseSalary),
    );

    const bonuses = compensations.map((item) =>
      Number(item.bonus),
    );

    const stocks = compensations.map((item) =>
      Number(item.stock),
    );

    const totalCompensations = compensations.map((item) =>
      Number(item.totalCompensation),
    );

    const average = (values: number[]) =>
      sum(values) / values.length;

    const levelMap = new Map<
      string,
      {
        records: number;
        totalCompensation: number;
      }
    >();

    for (const compensation of compensations) {
      const levelName = compensation.level.name;

      const existing = levelMap.get(levelName);

      if (existing) {
        existing.records += 1;
        existing.totalCompensation += Number(
          compensation.totalCompensation,
        );
      } else {
        levelMap.set(levelName, {
          records: 1,
          totalCompensation: Number(
            compensation.totalCompensation,
          ),
        });
      }
    }

    const byLevel = Array.from(
      levelMap.entries(),
    ).map(([level, data]) => ({
      level,
      records: data.records,
      averageTotalCompensation:
        data.totalCompensation / data.records,
    }));

    return {
      company: company.name,
      totalRecords: compensations.length,
      averages: {
        baseSalary: average(baseSalaries),
        bonus: average(bonuses),
        stock: average(stocks),
        totalCompensation: average(
          totalCompensations,
        ),
      },
      byLevel,
    };
  }
}