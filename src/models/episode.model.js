import { DataTypes } from 'sequelize';
import { sequelize } from "../db/db.connection.js";

export const Episode = sequelize.define('episode',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING
    },
   
},   {
  timestamps: false
});
