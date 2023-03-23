import { Director } from "../models/Director.model.js";
import { Movie } from "../models/movie.model.js";
import { Actor } from "../models/actor.model.js";
import { Sequelize } from 'sequelize';
const Op = Sequelize.Op;

export class MovieService {

    //returns all movies from DB
    async findAll() {

        try {
            const movies = await Movie.findAll();
            return movies;

        } catch (error) {

            throw new Error(error);
        };
    };

    //returns a mvovie based on Id from DB
    async findById(id) {

        try {
            const movie = await Movie.findOne({
                where:
                {
                    id
                },
                include: [{
                    model: Director,
                    as: 'director'
                }, {
                    model: Actor,
                }]
            });
            return movie;

        } catch (error) {
            throw new Error(error);

        };
    };

    //searches and returns a movies based on genre or title
    async search(query) {

        try {
            const filteredMovies = await Movie.findAll({
                where: {
                    [Op.or]: {
                        genre: {
                            [Op.like]: query.genre
                        },
                        title: {
                            [Op.like]: `%` + query.title + `%`
                        }

                    }

                }

            });

            return filteredMovies;
        } catch (error) {
            throw new Error(error);
        }

    }

    //creates a new movie
    async create(data) {

        try {
            const newMovie = await Movie.create({
                title: data.title,
                genre: data.genre,
                budget: data.budget,
                year: data.year
            });

            await newMovie.save();

            if (data.actorId) {
                await Actor_Movie.create({
                    actorId: data.actorId,
                    movieId: newMovie.id
                });
            };
            if (data.directorId) {
                await Movie.update({
                    directorId: data.directorId
                },
                    {
                        where: {
                            id: newMovie.id
                        }
                    });
            }

            return newMovie;
        } catch (error) {
            throw new Error(error);
        }
    }

};