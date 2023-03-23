import { Movie } from './movie.model.js';
import { Actor } from './actor.model.js';
import { Director } from './director.model.js';
import { Tvshow } from './tvshow.model.js';
import { Season } from './season.model.js';
import { Episode } from './episode.model.js';
import { ActorMovie } from './actorMovie.model.js';
import { ActorTvshow } from './actorTvshow.model.js';

//1:N relationship 
Director.hasMany(Movie);

Movie.belongsTo(Director);

//N:M relationship
Actor.belongsToMany(Movie, {
    through: ActorMovie
});

Movie.belongsToMany(Actor, {
    through: ActorMovie
});

//1:N relationship
Tvshow.belongsTo(Director);

Director.hasMany(Tvshow);

//N:M relationship
Actor.belongsToMany(Tvshow, {
    through: ActorTvshow
});

Tvshow.belongsToMany(Actor, {
    through: ActorTvshow
})

//1:N relationship
Tvshow.hasMany(Season, {
    foreignKey: 'tvshowId',
    sourceId: 'id'
});

Season.belongsTo(Tvshow, {
    foreignKey: 'tvshowId',
    targetId: 'id'
});

//1:N relationship
Season.hasMany(Episode, {
    foreignKey: 'seasonId',
    sourceId: 'id'
});

Episode.belongsTo(Season, {
    foreignKey: 'seasonId',
    targetId: 'id'
});



