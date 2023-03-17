import { DataTypes } from 'sequelize';
import { sequelize } from "../db/db.connection.js";


export const Movie = sequelize.define('movie',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING
    },
    genre: {
        type: DataTypes.STRING
    },
    budget: {
        type: DataTypes.STRING
    },
    year: {
        type: DataTypes.DATE
    },
  
},   {
    timestamps: false
});



