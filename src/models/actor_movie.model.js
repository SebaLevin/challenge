import { sequelize } from "../db/db.connection.js";

export const Actor_Movie = sequelize.define('actor_movie',{}, { timestamps: false });