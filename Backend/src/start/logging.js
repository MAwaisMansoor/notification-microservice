import winston, { createLogger, format } from 'winston';
import config from 'config';
import { v4 } from 'uuid';
const logLevel = config.get('LOG_LEVEL') || 'verbose';

const logFormat = format.printf(({ level, message, timestamp, traceId }) =>
  JSON.stringify({ timestamp, level, traceId, message })
);

export const logger = createLogger({
  level: logLevel,
  format: format.combine(format.timestamp(), logFormat),
  transports: [
    // new winston.transports.Console(),
    new winston.transports.File({ filename: 'logfile.log' }),
  ],
});

export const handleExceptions = () => {
  ['uncaughtException', 'unhandledRejection'].forEach((exception) =>
    process.on(exception, (err) => {
      logger.error(err.message, { traceId: v4() });
      process.exit(1);
    })
  );
};
