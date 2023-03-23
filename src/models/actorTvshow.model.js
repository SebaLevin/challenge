import { sequelize } from "../db/db.connection.js";

export const ActorTvshow = sequelize.define('actorTvshow', {}, { timestamps: false });