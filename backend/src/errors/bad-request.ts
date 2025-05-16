import { statusCode } from '../utils';

export class BadRequestError extends Error {
  public statusCode: number;
  public authFailed?: boolean;

  constructor(message: string, authFailed?: boolean) {
    super(message);
    this.statusCode = statusCode.BAD_REQUEST;
    this.authFailed = authFailed;
  }
}
