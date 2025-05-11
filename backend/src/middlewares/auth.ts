import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { verifyJwt } from '../utils';
import { NotFoundError, UnauthorizedError } from '../errors';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Неавторизованный доступ'));
  }

  const token = authHeader.split(' ')[1];

  verifyJwt(token)
    .then(decoded => {
      User.findById(decoded._id)
        .then((user) => {
          if (!user) {
            return next(new NotFoundError('Пользователь не найден'));
          }

          req.user = user;
          next();
        })
        .catch((err) => next(new UnauthorizedError(err.message)));
    })
    .catch((err) => next(new UnauthorizedError(err.message)));
};
