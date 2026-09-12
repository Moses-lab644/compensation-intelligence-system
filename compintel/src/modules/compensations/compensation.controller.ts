import {
BadRequestException,
Body,
ConflictException,
Controller,
Get,
Inject,
InternalServerErrorException,
Post,
Query,
} from "@nestjs/common";

import { CompensationService } from "./compensation.service.js";
import { createCompensationSchema } from "./compensation.schema.js";
import { getCompensationsQuerySchema } from "./compensation.query.schema.js";

@Controller("api/compensations")
export class CompensationController {
constructor(
@Inject(CompensationService)
private readonly compensationService: CompensationService,
) {}

@Post()
async createCompensation(@Body() body: unknown) {
const result = createCompensationSchema.safeParse(body);


if (!result.success) {
  throw new BadRequestException({
    success: false,
    message: "Validation failed",
    errors: result.error.flatten().fieldErrors,
  });
}

try {
  const compensation =
    await this.compensationService.createCompensation(
      result.data,
    );

  return {
    success: true,
    message: "Compensation record created successfully",
    data: compensation,
  };
} catch (error) {
  if (
    error instanceof Error &&
    error.message ===
      "An identical compensation record already exists"
  ) {
    throw new ConflictException({
      success: false,
      message: error.message,
    });
  }

  console.error(
    "Create compensation error:",
    error,
  );

  throw new InternalServerErrorException({
    success: false,
    message: "Internal server error",
  });
}


}

@Get("compare")
async compareCompensation(@Query() query: unknown) {
const result =
getCompensationsQuerySchema.safeParse(query);


if (!result.success) {
  throw new BadRequestException({
    success: false,
    message: "Invalid comparison parameters",
    errors: result.error.flatten().fieldErrors,
  });
}

if (!result.data.companies) {
  throw new BadRequestException({
    success: false,
    message:
      "The companies parameter is required for comparison",
  });
}

try {
  const comparison =
    await this.compensationService.compareCompensation(
      result.data,
    );

  return {
    success: true,
    data: comparison,
  };
} catch (error) {
  console.error(
    "Compare compensation error:",
    error,
  );

  throw new InternalServerErrorException({
    success: false,
    message: "Internal server error",
  });
}


}

@Get()
async getCompensations(@Query() query: unknown) {
const parsedQuery =
getCompensationsQuerySchema.safeParse(query);


if (!parsedQuery.success) {
  throw new BadRequestException({
    success: false,
    message: "Invalid query parameters",
    errors: parsedQuery.error.flatten().fieldErrors,
  });
}

try {
  const resultData =
    await this.compensationService.getCompensations(
      parsedQuery.data,
    );

  return {
    success: true,
    ...resultData,
  };
} catch (error) {
  console.error(
    "Get compensations error:",
    error,
  );

  throw new InternalServerErrorException({
    success: false,
    message: "Internal server error",
  });
}


}
}
