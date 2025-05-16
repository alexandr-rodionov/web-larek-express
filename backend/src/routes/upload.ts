import { Router } from 'express';
import { auth, file } from '../middlewares';
import { uploadFile } from '../controllers';

export const uploadRouter = Router();

uploadRouter.post('/', auth, file.single('file'), uploadFile);
