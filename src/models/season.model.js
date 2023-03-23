import { DataTypes } from 'sequelize';
import { sequelize } from "../db/db.connection.js";

export const Season = sequelize.define('season', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    seasonNumber: {
        type: DataTypes.INTEGER
    },
    year: {
        type: DataTypes.DATE
    },

}, {
    timestamps: false
});