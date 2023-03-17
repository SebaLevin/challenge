import express from "express";
import cors from 'cors';
import bodyParser from "body-parser";
import routes from "./routes/index.js";
import {sequelize} from './db/db.connection.js'
const app = express();


app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());


app.use('/api', routes);
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Ohh you are lost, read the API documentation to find your way back home :)'
    })
})

export default app;

