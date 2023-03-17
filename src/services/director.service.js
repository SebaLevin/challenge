import { Director } from "../models/Director.model.js";
import { Movie } from "../models/movie.model.js";
import { Tvshow } from "../models/tvshow.model.js";

export class DirectorService {
    
    async findAll() {
        
        try {
            const directors = await Director.findAll();
            return directors;
            
        } catch (error) {
            
            throw new Error(error);
        };
    };

    async findById(id){
       
        try {
            const director = await Director.findOne({
                where: 
                {
                    id
                }, 
                include:[ {
                    model: Tvshow
                }]
            });
            return director;
            
        } catch (error) {
            throw new Error(error);
           
        };
    };

    async create(data) {
     
        try {
            const newDirector = await Director.create({
                name: data.name,
                age: data.age,
                nationality: data.nationality,
            });
            if(data.tvshowId){
                await Tvshow.update({
                    directorId: data.tvshowId
                });
            };
            if(data.movieId){
                await Movie.update({
                    directorId: data.movieId
                })
            }

            return newDirector;
        } catch (error) {
            throw new Error(error);
        }
    }

};