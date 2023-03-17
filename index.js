import  app from './src/app.js';

import { PORT } from './src/constants/index.js';
import {sequelize} from './src/db/db.connection.js'
import chalk from 'chalk';
import './src/models/index.js'



const port = PORT || 3001;

const main = async () => {
    try {
        await sequelize.authenticate();
        console.log(chalk.magentaBright('Connection has been stablished succesfully.'));
        
        await sequelize.sync({ force: true});

        app.listen(port, () => {
            console.log(chalk.green(`Server running on port ${port}`));
        });
    } catch (error) {
        console.error(chalk.red('Unable to connect to the database', error));
    }   
 
};

main();