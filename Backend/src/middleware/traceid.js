import { v4 } from 'uuid';

export const traceId = (req, _, next) => {
  if (!req.headers.traceId) {
    req.headers.traceId = v4();
  }

  next();
};
