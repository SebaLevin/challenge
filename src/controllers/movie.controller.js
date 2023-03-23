import { MovieService } from "../services/index.js";

const movieServices = new MovieService();

export class MovieController {

    async getAll(req, res) {

        try {
            const response = await movieServices.findAll();

            if (response.length === 0) {
                return res.status(404).send("There is no data to get!");
            };

            return res.status(200).send(response);
        } catch (error) {

            return res.status(500).send(error.message);
        };
    };

    async getById(req, res) {
        const { id } = req.params;

        try {
            const response = await movieServices.findById(id);

            if (!response) {
                return res.status(404).send("The Id provided doesn't much an excisting movie!");
            };

            return res.status(200).send(response);
        } catch (error) {

            return res.status(500).send(error.message);
        };
    };

    async search(req, res) {
        const { genre, title } = req.query;

        try {
            const response = await movieServices.search({ genre, title });

            if (response.length === 0) {
                return res.status(404).send("There is no data to get!");
            };

            return res.status(200).send(response);
        } catch (error) {

            return res.status(500).send(error.message);
        };
    }

    async create(req, res) {
        const { title, genre, budget, year, actorId, movieId } = req.body;

        if (!title || !genre) {
            return res.status(400).send({ message: "There are some required fields missing!" });
        }
        try {
            const body = {
                title, genre, budget, year, actorId, movieId
            }
            await movieServices.create(body);
            return res.status(200).send('Movie created succesfully');
        } catch (error) {
            return res.status(500).send(error.message);
        };
    };

};