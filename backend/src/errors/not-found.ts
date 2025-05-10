import { statusCode } from '../utils';

export class NotFoundError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = statusCode.NOT_FOUND;
  }
}