import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../constants/index.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, TOKEN_SECRET, (err) => {
    console.log(err)

    if (err) return res.sendStatus(403)


    next()
  });
};