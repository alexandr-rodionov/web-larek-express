import { statusCode } from '../utils';

export class NotFoundError extends Error {
  public statusCode: number;
  public authFailed?: boolean;

  constructor(message: string, authFailed?: boolean) {
    super(message);
    this.statusCode = statusCode.NOT_FOUND;
    this.authFailed = authFailed;
  }
}
