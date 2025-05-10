import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  tokens: Array<{ token: string }>;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null;
    }
  }
}

export {};