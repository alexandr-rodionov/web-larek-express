import express from 'express';
import {
  login,
  register,
  logout,
  refreshAccessToken,
  getCurrentUser
} from '../controllers';
import { auth } from '../middlewares';

export const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/register', register);

authRouter.get('/token', auth, refreshAccessToken);
authRouter.get('/logout', logout);
authRouter.get('/user', auth, getCurrentUser);