import path from 'path';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';
import config from './config';
import { routers } from './routes';
import {
  errorHandler,
  errorLogger,
  requestLogger
} from './middlewares';

import './utils/clear-temp-files';
import './utils/clear-expired-tokens';

const { port, mongoUrl, corsOptions } = config;

mongoose.connect(mongoUrl)
  .then(() => {
    console.log('MongoDB connected');

    const app = express();

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(requestLogger);
    app.use('/', routers);
    app.use(errorLogger);
    app.use(errors());
    app.use(errorHandler);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err)
    process.exit(1);
  });
