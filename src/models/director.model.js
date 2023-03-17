import { DataTypes } from 'sequelize';
import { sequelize } from "../db/db.connection.js";

export const Director = sequelize.define('director',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING
    },
    age: {
        type: DataTypes.STRING
    },
    nationality: {
        type: DataTypes.STRING
    },
      
}, {
  timestamps: false
});

