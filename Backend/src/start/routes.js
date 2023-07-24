import express from 'express';
import {
  checkAuth,
  errorHandler,
  checkAdmin,
  traceId,
  logRequest,
} from '../middleware/index.js';
import {
  auth,
  home,
  user,
  application,
  event,
  notificationType,
  message,
} from '../routes/index.js';
import { StatusCodes } from 'http-status-codes';

export const routes = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    next();
  });

  app.use(traceId);
  app.use(logRequest);

  app.use('/', home);

  app.use('/api/auth', auth);

  app.use(checkAuth);
  // app.use(checkAdmin);

  app.use('/api/users', user);
  app.use('/api/applications', application);
  app.use('/api/events', event);
  app.use('/api/notification-types', notificationType);
  app.use('/api/messages', message);

  app.use('*', (_, res) =>
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: '404 - Page Not Found!', result: {} })
  );

  app.use(errorHandler);
};
