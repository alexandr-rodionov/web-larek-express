import { Request, Response, NextFunction } from 'express';

type THttpError = {
  statusCode: number;
  message: string;
}

export const errorHandler = (err: THttpError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = 500, message = 'Internal Server Error' } = err;

  res.status(statusCode).send({ message: message });
};