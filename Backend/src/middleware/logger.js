import { logger } from '../start/logging.js';

export const logRequest = (req, _, next) => {
  let password = '';
  if (req.body?.password) {
    password = req.body.password;
    delete req.body['password'];
  }
  logger.info(
    JSON.stringify({ method: req.method, url: req.url, payload: req.body }),
    {
      traceId: req.headers.traceId,
    }
  );
  if (password) req.body.password = password;
  next();
};
