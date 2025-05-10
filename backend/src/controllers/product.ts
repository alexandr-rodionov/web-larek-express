import path from 'path';
import fs from 'fs/promises';
import { Error as MongooseError } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import config from '../config';
import { Product } from '../models';
import { statusCode } from '../utils';
import { BadRequestError, ConflictError } from '../errors';

const { uploadDir, tempUploadDir } = config;

// READ
export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Product.find({})
    .then((products) => res.status(statusCode.OK).send({ items: products, total: products.length }))
    .catch(err => next(err));
}

// CREATE
export const createProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, image, category, description, price } = req.body;

  Product.create({ title, image, category, description, price })
    .then(async (createdProduct) => {
      if (image?.fileName) {
        const baseName = path.basename(image.fileName);
        const oldPath = path.join(__dirname, '..', tempUploadDir, baseName);
        const newPath = path.join(__dirname, '..', 'public', uploadDir, baseName);

        await fs.rename(oldPath, newPath);
        createdProduct.image.fileName = `/${uploadDir}/${baseName}`;
      }

      res.status(statusCode.CREATED).send(createdProduct);
    })
    .catch(err => {
      if (err instanceof MongooseError.ValidationError) {
        return next(new BadRequestError(err.message));
      }
      if (err instanceof Error && err.message.includes('E11000')) {
        return next(new ConflictError('Already exists'));
      }
      return next(err);
    });
};

// UPDATE
export const updateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;
  const updates = req.body;

  Product.findByIdAndUpdate(productId, updates, { new: true })
    .then(async updatedProduct => {
      if (!updatedProduct) throw new Error('Product not found');

      if (updates.image?.fileName) {
        const baseName = path.basename(updates.image.fileName);
        const oldPath = path.join(__dirname, '..', tempUploadDir, baseName);
        const newPath = path.join(__dirname, '..', 'public', uploadDir, baseName);

        await fs.rename(oldPath, newPath);
        updatedProduct.image.fileName = `/${uploadDir}/${baseName}`;
      }

      res.status(statusCode.OK).send(updatedProduct);
    })
    .catch(err => next(err));
};

// DELETE
export const deleteProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;

  Product.findById(productId)
    .then(async productToDelete => {
      if (!productToDelete) throw new Error('Product not found');

      if (productToDelete.image?.fileName) {
        const filePath = path.join(__dirname, '..', 'public', productToDelete.image.fileName);
        await fs.unlink(filePath);
      }

      await Product.findByIdAndDelete(productId);

      res.status(statusCode.OK).send(productToDelete);
    })
    .catch(err => next(err));
};
