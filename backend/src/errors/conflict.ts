import { statusCode } from '../utils';

export class ConflictError extends Error {
  public statusCode: number;
  public authFailed?: boolean;

  constructor(message: string, authFailed?: boolean) {
    super(message);
    this.statusCode = statusCode.CONFLICT;
    this.authFailed = authFailed;
  }
}
