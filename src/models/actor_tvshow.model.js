import { sequelize } from "../db/db.connection.js";

export const Actor_Tvshow = sequelize.define('actor_tvshow',{}, { timestamps: false });