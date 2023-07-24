import 'express-async-errors';
import express from 'express';
import debug from 'debug';
import config from 'config';
import { routes, configurations } from './start/index.js';
import { handleExceptions } from './start/logging.js';
import mongoose from 'mongoose';

const port = config.get('PORT') || 5000;
const dbType = config.get('DB.TYPE') || 'postgres';
const debugApp = debug('app:startup');

handleExceptions();

configurations();

const app = express();
routes(app);

let server;

const listen = () =>
  (server = app.listen(port, () =>
    debugApp(`App is listening on port ${port}`)
  ));

if (dbType === 'mongodb')
  mongoose
    .connect(
      `mongodb+srv://${config.get('DB.USER')}:${config.get(
        'DB.PASSWORD'
      )}@cluster0.w8g3rk6.mongodb.net/${config.get(
        'DB.NAME'
      )}?retryWrites=true&w=majority`
    )
    .then(listen())
    .catch((err) => debugApp(err));
else listen();

export { server };
