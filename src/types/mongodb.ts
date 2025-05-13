
import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  password: string; // This would be hashed
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  url: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageStats {
  totalImages: number;
  publicImages: number;
  privateImages: number;
}
