import _ from "lodash";
import { faker } from "@faker-js/faker";
import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { Product } from "../models";
import { statusCode } from "../utils";
import { BadRequestError } from "../errors";

export const createOrder = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { total, items } = req.body;

  if(!items?.length) return next(new BadRequestError('В заказе нет товара'));

  Product.find({ _id: { $in: items }})
    .then((products) => {
      if (products.length !== items.length) {
        const missingProducts = _.differenceWith(
          items, products, (itemId: string, product) => product._id.equals(itemId)
        );
        return next(new BadRequestError(`Некоторые товары не найдены: ${missingProducts.join(", ")}`));
      }

      if (_.some(products, product => product.price === null)) {
        const unavailableProducts = _.filter(products, product => product.price === null);
        return next(
          new BadRequestError(
            `Некоторые товары недоступны: ${unavailableProducts.map((p) => p._id).join(", ")}`
          )
        );
      }

      const calculatedTotal =  _.sumBy(products, 'price');
      if (Math.abs(calculatedTotal - total) > Number.EPSILON) {
        return next(new BadRequestError('Ошибка в расчёте суммы заказа'));
      }

      const orderId = faker.string.uuid();
      res.status(statusCode.CREATED).send({ id: orderId, total: calculatedTotal});
    })
    .catch((err) => {
      if (err instanceof MongooseError.ValidationError) {
        return next(new BadRequestError(err.message));
      };
      return next(err);
    });
};
