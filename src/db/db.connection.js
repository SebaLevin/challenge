import Sequelize from "sequelize";
import { DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_DIALECT } from '../constants/index.js';

export const sequelize = new Sequelize(
    DATABASE_NAME,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    {
        host: DATABASE_HOST,
        dialect: DATABASE_DIALECT,
    }
);

