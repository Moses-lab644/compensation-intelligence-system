import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const port = process.env.PORT ?? 5000;

  await app.listen(port);

  console.log(`NestJS server running on port ${port}`);
}

bootstrap();