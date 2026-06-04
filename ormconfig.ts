import "reflect-metadata";
import { DataSource } from "typeorm";

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL ?? "postgres://cre:cre@localhost:5432/cre_kg",
  entities: ["lib/db/entities/*.entity.ts"],
  migrations: ["lib/db/migrations/*.ts"],
  synchronize: false,
  logging: false
});
