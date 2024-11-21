import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize({
  host: "localhost",
  port: "5432",
  dialect: "postgres",
  username: "admin",
  password: "secret",
  database: "EBN",
});
