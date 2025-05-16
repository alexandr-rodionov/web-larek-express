import path from 'path';
import fs from 'fs/promises';
import { Request } from 'express';
import multer, { diskStorage, FileFilterCallback } from 'multer';
import config from '../config';

const { tempUploadDir } = config;

const TEMP_UPLOAD_DIR = path.resolve(__dirname, '..', tempUploadDir);

fs.mkdir(TEMP_UPLOAD_DIR, { recursive: true }).catch(console.error);

const storage = diskStorage({
  destination(
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, dest: string) => void
  ) {
    cb(null, TEMP_UPLOAD_DIR );
  },
  filename(
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const limits = { fileSize: 5 * 1024 * 1024, };

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!file.mimetype.match(/jpg|jpeg|png/g)) {
    return cb(new Error('Только JPG/JPEG/PNG разрешены!'));
  }

  cb(null, true);
};

export const file = multer({ storage, limits, fileFilter });
