import mongoose from 'mongoose';

interface IProduct {
  title: string;
  image: { fileName: string; originalName: string};
  category: string;
  description?: string;
  price?: number;
}

const ProductSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    unique: true,
    trim: true,
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
    required: [true, 'Поле "title" должно быть заполнено']
  },
  image: {
    type: Object,
    required: [true, 'Поле "image" должно быть заполнено'],
    properties: {
      fileName: { type: String, required: true },
      originalName: { type: String, required: true }
    }
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено']
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    default: null
  }
});

ProductSchema.index({ title: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
