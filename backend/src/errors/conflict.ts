import { statusCode } from '../utils';

export class ConflictError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = statusCode.CONFLICT;
  }
}
