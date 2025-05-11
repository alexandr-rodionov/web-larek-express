import mongoose from 'mongoose';
import { IUser } from '../types.d'

const UserSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
    default: 'Ё-мое'
  },
  email: {
    type: String,
    required: [true, 'Поле "email" должно быть заполнено'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Поле "password" должно быть заполнено'],
    select: false
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
        select: false
      }
    }
  ]
});

export const User = mongoose.model<IUser>('User', UserSchema);
