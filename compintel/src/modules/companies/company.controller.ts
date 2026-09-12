import {
BadRequestException,
Controller,
Get,
Inject,
InternalServerErrorException,
NotFoundException,
Param,
} from "@nestjs/common";

import { CompanyService } from "./company.service.js";

@Controller("api/companies")
export class CompanyController {
constructor(
@Inject(CompanyService)
private readonly companyService: CompanyService,
) {}

@Get(":companyName/summary")
async getCompanySummary(
@Param("companyName") companyName: string,
) {
if (!companyName?.trim()) {
throw new BadRequestException({
success: false,
message: "Company name is required",
});
}


try {
  const summary =
    await this.companyService.getCompanySummary(
      companyName,
    );

  return {
    success: true,
    data: summary,
  };
} catch (error) {
  if (
    error instanceof Error &&
    error.message === "Company not found"
  ) {
    throw new NotFoundException({
      success: false,
      message: error.message,
    });
  }

  console.error(
    "Get company summary error:",
    error,
  );

  throw new InternalServerErrorException({
    success: false,
    message: "Internal server error",
  });
}


}
}
