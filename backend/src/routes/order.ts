import { Router } from 'express';
import { createOrder } from '../controllers';
import { validateOrder } from '../middlewares';

export const orderRouter = Router();

orderRouter.post('/', validateOrder, createOrder);
