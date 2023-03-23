import express from "express";
import cors from 'cors';
import bodyParser from "body-parser";
import routes from "./routes/index.js";
const app = express();


//middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//api routes
app.use('/api', routes);

//if the route don't match it throws a 404 error
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Ohh you are lost, read the API documentation to find your way back home :)'
    })
})

export default app;

