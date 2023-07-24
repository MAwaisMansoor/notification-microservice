import { StatusCodes } from 'http-status-codes';

export const checkAdmin = (req, res, next) => {
  if (!req.userData.isAdmin)
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ success: false, message: 'Access denied!', result: {} });

  next();
};
