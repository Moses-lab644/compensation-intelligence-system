import "dotenv/config";

import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService
extends PrismaClient
implements OnModuleDestroy
{
constructor() {
const connectionString =
process.env.DATABASE_URL;


if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not defined",
  );
}

const adapter = new PrismaPg({
  connectionString,
});

super({
  adapter,
});


}

async onModuleDestroy() {
await this.$disconnect();
}
}
