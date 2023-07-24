import { StatusCodes } from 'http-status-codes';
import { verifyToken } from '../util/jwt.js';

export const checkAuth = (req, res, next) => {
  //browser sends options request before any request except GET
  if (req.method === 'OPTIONS') return next();

  const token = req.get('x-auth-token');

  if (!token) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Authentication failed! Token missing.',
      result: {},
    });
  }

  req.userData = verifyToken(token);

  next();
};
