import ms from 'ms';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { Response } from 'express';
import config from '../config';

const { refreshTokenExpiry, accessTokenExpiry, jwtSecret } = config;

export const generateToken = (_id: Types.ObjectId) => ({
  accessToken: jwt.sign(
    { _id: _id.toString() },
    jwtSecret,
    { expiresIn: accessTokenExpiry as ms.StringValue }),
  refreshToken: jwt.sign(
    { _id: _id.toString() },
    jwtSecret,
    { expiresIn: refreshTokenExpiry as ms.StringValue}
  )
});

export const hashPassword = (password: string) =>
  bcrypt.hash(password, 10);

export const checkPassword = (inputPassword: string, storedHash: string) =>
  bcrypt.compare(inputPassword, storedHash);

export const setRefreshCookie = (res: Response, token: string) => {
  const maxAge = ms(refreshTokenExpiry as ms.StringValue);
  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge,
    path: '/'
  });
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/'
  });
};

interface DecodedToken {
  _id: string;
}

export const verifyJwt = (token: string): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err || !decoded || typeof decoded !== 'object' || !decoded._id) {
        reject(new Error('Токен устарел или неверен'));
      } else {
        resolve(decoded as DecodedToken);
      }
    });
  });
};
