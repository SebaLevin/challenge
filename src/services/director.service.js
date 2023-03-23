import { Director } from "../models/Director.model.js";
import { Movie } from "../models/movie.model.js";
import { Tvshow } from "../models/tvshow.model.js";

export class DirectorService {
    //returns all directirs from DB
    async findAll() {

        try {
            const directors = await Director.findAll();
            return directors;

        } catch (error) {

            throw new Error(error);
        };
    };

    //returns a director based on Id from DB
    async findById(id) {

        try {
            const director = await Director.findOne({
                where:
                {
                    id
                },
            });
            return director;

        } catch (error) {
            throw new Error(error);

        };
    };


    //cretes a new director
    async create(data) {

        try {
            const newDirector = await Director.create({
                name: data.name,
                age: data.age,
                nationality: data.nationality,
            });

            await newDirector.save();

            if (data.tvshowId) {
                await Tvshow.update({
                    directorId: newDirector.id
                },
                    {
                        where: {
                            id: data.movieId
                        }
                    });
            };
            if (data.movieId) {
                await Movie.update({
                    directorId: newDirector.id
                },
                    {
                        where: {
                            id: data.movieId
                        }
                    });
            }

            return newDirector;
        } catch (error) {
            throw new Error(error);
        }
    }

};