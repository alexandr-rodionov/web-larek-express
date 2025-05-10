import { Router } from 'express';
import { authRouter } from './auth';
import { orderRouter } from './order';
import { uploadRouter } from './upload';
import { productRouter } from './product';
import { NotFoundError } from '../errors';

export const routers = Router();

routers.use('/product', productRouter);
routers.use('/order', orderRouter);
routers.use('/auth', authRouter);
routers.use('/upload', uploadRouter);

routers.use((req, res, next) => {
  next(new NotFoundError('Route not found'));
});