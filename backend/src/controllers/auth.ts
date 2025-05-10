import { Request, Response } from 'express';
import { User } from '../models';
import {
  generateToken,
  hashPassword,
  checkPassword,
  setRefreshCookie,
  clearRefreshCookie,
  verifyJwt,
  statusCode
} from '../utils';

// LOGIN
export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return res.status(statusCode.UNAUTHORIZED).send({ success: false, message: 'Email или пароль указаны неверно' });
      }

      checkPassword(password, user.password)
        .then((isMatch) => {
          if (!isMatch) {
            return res.status(statusCode.UNAUTHORIZED).send({ success: false, message: 'Email или пароль указаны неверно' });
          }

          const { accessToken, refreshToken } = generateToken(user._id);

          User.updateOne({ _id: user._id }, { $push: { tokens: { token: refreshToken } } })
            .then(() => {
              setRefreshCookie(res, refreshToken);
              res.status(statusCode.OK).send({
                user: { email: user.email, name: user.name },
                success: true,
                accessToken
              });
            })
            .catch(() => res.status(statusCode.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Ошибка при сохранении токена' }));
        })
        .catch(() => res.status(statusCode.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Ошибка при проверке пароля' }));
    })
    .catch(() => res.status(statusCode.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Ошибка при обработке запроса' }));
};

// REGISTER
export const register = (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(statusCode.CONFLICT).send({ success: false, message: 'Пользователь с указанным email уже существует' });
      }

      hashPassword(password)
        .then((hashedPassword) => {
          const newUser = new User({ name, email, password: hashedPassword });

          newUser.save()
            .then((savedUser) => {
              const { accessToken, refreshToken } = generateToken(savedUser._id);

              User.updateOne({ _id: savedUser._id }, { $push: { tokens: { token: refreshToken } } })
                .then(() => {
                  setRefreshCookie(res, refreshToken);
                  res.status(statusCode.CREATED).send({
                    user: { email: savedUser.email, name: savedUser.name },
                    success: true,
                    accessToken
                  });
                })
                .catch(() => res.status(statusCode.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Ошибка при сохранении токена' }));
            })
            .catch(() => res.status(statusCode.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Ошибка при регистрации пользователя' }));
        })
        .catch(() => res.status(statusCode.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Ошибка при хэширование пароля' }));
    })
    .catch(() => res.status(statusCode.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Ошибка при обработке запроса' }));
};

// REFRESH_TOKEN
export const refreshAccessToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(statusCode.UNAUTHORIZED).send({ success: false, message: 'Отсутствует refresh-токен' });
  }

  verifyJwt(refreshToken)
    .then((decoded) => {
      User.findById(decoded._id)
        .then(user => {
          if (!user) {
            return res.status(statusCode.NOT_FOUND).send({ success: false, message: 'Пользователь не найден' });
          }

          const hasOldToken = user.tokens.some((t) => t.token === refreshToken);
          if (!hasOldToken) {
            return res.status(statusCode.UNAUTHORIZED).send({ success: false, message: 'Refresh-токен больше не действителен' });
          }

          const { accessToken, refreshToken: newRefreshToken } = generateToken(user._id);

          User.updateOne({ _id: user._id }, { $set: { tokens: [{ token: newRefreshToken }] } })
            .then(() => {
              setRefreshCookie(res, newRefreshToken);
              res.status(statusCode.OK).send({
                user: { email: user.email, name: user.name },
                success: true,
                accessToken
              });
            })
            .catch(() => res.status(statusCode.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Ошибка при обновлении токена' }));
        })
        .catch(() => res.status(statusCode.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Ошибка при обработке запроса' }));
    })
    .catch((err) => res.status(statusCode.UNAUTHORIZED).send({ success: false, message: err.message }));
};

// LOGOUT
export const logout = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(statusCode.BAD_REQUEST).send({ success: false, message: 'Отсутствует refresh-токен' });
  }

  User.findOneAndUpdate(
    { 'tokens.token': refreshToken },
    { $pull: { tokens: { token: refreshToken } } },
    { new: true }
  )
    .then(user => {
      if (!user) {
        return res.status(404).send({ success: false, message: 'Пользователь не найден' });
      }

      clearRefreshCookie(res);
      res.status(statusCode.OK).send({ success: true });
    })
    .catch(() => res.status(statusCode.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Ошибка при обработке запроса' }));
};

// CURRENT_USER
export const getCurrentUser = (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(statusCode.NOT_FOUND).send({ success: false, message: 'Пользователь не найден' });
  }

  res.status(statusCode.OK).send({
    user: { email: user.email, name: user.name },
    success: true
  });
};
