import path from 'path';
import { NextFunction, Request, Response } from 'express';
import config from '../config';
import { statusCode } from '../utils';

const { uploadDir } = config;

export const uploadFile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    next(new Error('Нет файла!'));
    return;
  };

  const relativePath = `/${uploadDir}/${path.basename(uploadedFile.path)}`;

  res.status(statusCode.OK).send({
    fileName: relativePath,
    originalName: uploadedFile.originalname,
  });
};
