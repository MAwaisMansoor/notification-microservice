import { StatusCodes } from 'http-status-codes';
import { logger } from '../start/logging.js';

export const errorHandler = (err, req, res) => {
  logger.error(err.message, { traceId: req.headers.traceId });
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Some unknown error occurred.',
    result: {},
  });
};
