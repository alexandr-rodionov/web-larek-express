import winston from 'winston';
import expressWinston from 'express-winston';

const requestLogTransport = new winston.transports.File({ filename: 'logs/request.log' });
const errorLogTransport = new winston.transports.File({ filename: 'logs/error.log' });

// Transport for Debug
const consoleTransport = new winston.transports.Console();

export const requestLogger = expressWinston.logger({
  transports: [requestLogTransport/*, consoleTransport*/],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint(),
    winston.format.colorize()
  ),
});

export const errorLogger = expressWinston.errorLogger({
  transports: [errorLogTransport/*, consoleTransport*/],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint(),
    winston.format.colorize()
  ),
});