import { statusCode } from '../utils';

export class UnauthorizedError extends Error {
  public statusCode: number;
  public authFailed: boolean;

  constructor(message: string) {
    super(message);
    this.statusCode = statusCode.UNAUTHORIZED;
    this.authFailed = false;
  }
}
