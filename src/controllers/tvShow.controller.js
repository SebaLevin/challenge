import { TvShowService } from "../services/index.js";

const tvShowServices = new TvShowService();

export class TvShowController {

    async getAll(req, res) {

        try {
            const response = await tvShowServices.findAll();

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
            const response = await tvShowServices.findById(id);

            if (!response) {
                return res.status(404).send("The Id provided doesn't much an excisting movie!");
            };

            return res.status(200).send(response);
        } catch (error) {

            return res.status(500).send(error.message);
        };
    };

    async create(req, res) {
        const { title, genre, year, actorId, directorId, seasonYear, seasonId, episodeTitle } = req.body;

        try {
            const body = {
                title,
                genre,
                year,
                actorId,
                directorId,
                seasonYear,
                seasonId,
                seasonNumber,
                espisodeNumber,
                episodeTitle
            }
            await tvShowServices.create(body);
            return res.status(200).send('TvShow created succesfully');
        } catch (error) {
            return res.status(500).send(error.message);
        };
    };

};