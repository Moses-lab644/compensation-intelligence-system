import { Module } from "@nestjs/common";
import { PrismaModule } from "./modules/prisma/prisma.module.js";
import { CompensationModule } from "./modules/compensations/compensation.module.js";
import { CompanyModule } from "./modules/companies/company.module.js";
import { HealthController } from "./health.controller.js";

@Module({
  imports: [
    PrismaModule,
    CompensationModule,
    CompanyModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}