import jwt  from 'jsonwebtoken';
import { TOKEN_SECRET, TOKEN_EXPIRATION_TIME  } from '../constants/index.js';

export class AuthService {


    generateToken(){

        //creating token
        const token = jwt.sign({}, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATION_TIME });

        return token;
    }

    getRefreshToken(refreshToken){
          
            //validates token
            const validateToken = jwt.verify(refreshToken, TOKEN_SECRET);
           
            //creates new token
            const newToken = jwt.sign({}, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATION_TIME});
                
            return newToken;
    } 
            
};
    
