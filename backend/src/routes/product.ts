import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers';
import { auth, validateProduct } from '../middlewares';

export const productRouter = Router();

productRouter.get('/', getProducts);

productRouter.post('/', auth, validateProduct, createProduct);
productRouter.patch('/:productId', auth, updateProduct);
productRouter.delete('/:productId', auth, deleteProduct);
