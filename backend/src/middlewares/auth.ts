import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { verifyJwt, statusCode } from '../utils';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res
      .status(statusCode.UNAUTHORIZED)
      .send({ success: false, message: 'Неавторизованный доступ' });

  const token = authHeader.split(' ')[1];

  verifyJwt(token)
    .then(decoded => {
      User.findById(decoded._id)
        .then((user) => {
          if (!user)
            return res
              .status(statusCode.NOT_FOUND)
              .send({ success: false, message: 'Пользователь не найден' });

          req.user = user;
          next();
        })
        .catch(() => res
          .status(statusCode.INTERNAL_SERVER_ERROR)
          .send({ success: false, message: 'Ошибка при обработке запроса' })
        );
    })
    .catch((err) => {
      res
        .status(statusCode.NOT_FOUND)
        .send({ success: false, message: err.message });
    });
};