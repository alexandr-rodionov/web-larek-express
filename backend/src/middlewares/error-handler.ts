import { Request, Response, NextFunction } from 'express';

type THttpError = {
  statusCode: number;
  message: string;
  authFailed?: boolean;
}

export const errorHandler = (err: THttpError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = 500, message = 'Internal Server Error', authFailed } = err;

  const resBody =
    typeof authFailed !== 'undefined' && !authFailed
      ? { success: authFailed, message }
      : { message };

  res.status(statusCode).send(resBody);
};
