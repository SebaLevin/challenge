import{ Movie }from './movie.model.js';
import{ Actor }from './actor.model.js';
import{ Director }from './director.model.js';
import{ Tvshow }from './tvshow.model.js';
import{ Season }from './season.model.js';
import{ Episode }from './episode.model.js';
import { Actor_Movie } from './actor_movie.model.js';
import { Actor_Tvshow } from './actor_tvshow.model.js';

// Director.hasMany(Movie, {
//     as: 'movie',
//     foreignKey: 'directorId',
// });

// Movie.belongsTo(Director, { as: 'director'});

// Actor.belongsToMany(Movie, {
//     through: Actor_Movie
// });

// Movie.belongsToMany(Actor, {
//     through: Actor_Movie
// });

Tvshow.belongsTo(Director);

Director.hasOne(Tvshow);

// Actor.belongsToMany(Tvshow, {
//     through: Actor_Tvshow
// });

// Tvshow.belongsToMany(Actor, {
//     through: Actor_Tvshow
// })

// Tvshow.hasMany(Season, {
//     foreignKey: 'tvshowId',
//     sourceId: 'id'
// });

// Season.belongsTo(Tvshow, {
//     foreignKey: 'tvshowId',
//     targetId: 'id'
// });

// Season.hasMany(Episode, {
//     foreignKey: 'seasonId',
//     sourceId: 'id'
// });

// Episode.belongsTo(Season, {
//     foreignKey: 'seasonId',
//     targetId: 'id'
// });



