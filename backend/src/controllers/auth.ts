import { NextFunction, Request, Response } from 'express';
import { User } from '../models';
import {
  generateToken,
  hashPassword,
  checkPassword,
  setRefreshCookie,
  clearRefreshCookie,
  verifyJwt,
  statusCode,
} from '../utils';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../errors';

// LOGIN
export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Email или пароль указаны неверно'));
      }

      checkPassword(password, user.password)
        .then((isMatch) => {
          if (!isMatch) {
            return next(new UnauthorizedError('Email или пароль указаны неверно'));
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
            .catch((err) => next(err));
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

// REGISTER
export const register = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  hashPassword(password)
    .then(async (hashedPassword) => {
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();

      const { accessToken, refreshToken } = generateToken(newUser._id);

      newUser.tokens.push({ token: refreshToken });

      await newUser.save();

      setRefreshCookie(res, refreshToken);

      res.status(statusCode.CREATED).send({
        user: { email: newUser.email, name: newUser.name },
        success: true,
        accessToken
      });
    })
    .catch((err) => {
      if (err instanceof Error && err.message.includes('E11000')) {
        return next(new ConflictError('Пользователь с указанным email уже существует', false));
      }
      return next(err);
    });
};

// REFRESH_TOKEN
export const refreshAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new UnauthorizedError('Отсутствует refresh-токен'));
  }

  verifyJwt(refreshToken)
    .then((decoded) => {
      User.findById(decoded._id)
        .then((user) => {
          if (!user) {
            return next(new NotFoundError('Пользователь не найден', false));
          }

          const hasOldToken = user.tokens.some((t) => t.token === refreshToken);
          if (!hasOldToken) {
            return next(new UnauthorizedError('Refresh-токен больше не действителен'));
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
            .catch((err) => next(err));
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

// LOGOUT
export const logout = (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new BadRequestError('Отсутствует refresh-токен', false));
  }

  User.findOneAndUpdate(
    { 'tokens.token': refreshToken },
    { $pull: { tokens: { token: refreshToken } } },
    { new: true }
  )
    .then(user => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден', false));
      }

      clearRefreshCookie(res);
      res.status(statusCode.OK).send({ success: true });
    })
    .catch((err) => next(err));
};

// CURRENT_USER
export const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return next(new NotFoundError('Пользователь не найден', false));
  }

  res.status(statusCode.OK).send({
    user: { email: user.email, name: user.name },
    success: true
  });
};
