import { ActorService } from "../services/index.js";

const actorService = new ActorService();

export class ActorController {

    async getAll(req, res) {

        try {
            const response = await actorService.findAll();

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
            const response = await actorService.findById(id);

            if (!response) {
                return res.status(404).send("The Id provided doesn't much an excisting actor!");
            };

            return res.status(200).send(response);
        } catch (error) {

            return res.status(500).send(error.message);
        };
    };

    async create(req, res) {
        const { name, age, nationality, awards, tvshowId } = req.body;

        if (!name) {
            return res.status(400).send({ message: "Name is required!" });
        }
        try {
            const body = {
                name, age, nationality, awards, tvshowId
            }
            await actorService.create(body);
            return res.status(200).send('Actor created succesfully');
        } catch (error) {
            return res.status(500).send(error.message);
        };
    };

};