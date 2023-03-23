import { sequelize } from "../db/db.connection.js";

export const ActorMovie = sequelize.define('actorMovie', {}, { timestamps: false });