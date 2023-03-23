import { Actor } from "../models/actor.model.js";
import { ActorTvshow } from "../models/actorTvshow.model.js";
import { Tvshow } from "../models/tvshow.model.js";
import { Movie } from "../models/movie.model.js";

export class ActorService {
    //returns all actors from DB
    async findAll() {
        try {
            const actors = await Actor.findAll();
            return actors;

        } catch (error) {

            throw new Error(error);
        };
    };

    //returns actor based on Id from DB
    async findById(id) {

        try {
            const actor = await Actor.findOne({
                where:
                {
                    id
                },

                include: [{
                    model: Tvshow,
                    attributes: { exclude: ['id', 'directorId'] },

                },
                {
                    model: Movie,
                    attributes: { exclude: ['id', 'directorId'] },
                }],


                attributes: {
                    exclude: ['id']
                }
            });
            return actor;

        } catch (error) {
            throw new Error(error);

        };
    };

    //creates new actor
    async create(data) {
        console.log(data.tvshowId)
        try {
            const newActor = await Actor.create({
                name: data.name,
                age: data.age,
                nationality: data.nationality,
                awards: data.awards
            });

            if (data.tvshowId) {
                await ActorTvshow.create({
                    actorId: newActor.id,
                    tvshowId: data.tvshowId
                });
            }

            return newActor;
        } catch (error) {
            throw new Error(error);
        }
    }

};