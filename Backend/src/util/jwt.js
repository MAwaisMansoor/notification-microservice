import jwt from 'jsonwebtoken';
import config from 'config';

export const getToken = (toSign, expiresIn = '24h') =>
  jwt.sign(toSign, config.get('JWT_PRIVATE_KEY'), { expiresIn });

export const verifyToken = (token) =>
  jwt.verify(token, config.get('JWT_PRIVATE_KEY'));
