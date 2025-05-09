import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";
import { IImage } from "./Image";

// Define the interface for Collection document
export interface ICollection extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId | IUser;
  isPublic: boolean;
  coverImage?: mongoose.Types.ObjectId | IImage;
  images: mongoose.Types.ObjectId[] | IImage[];
  createdAt: Date;
  updatedAt: Date;
}

// Define Collection schema
const CollectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: [true, "Collection name is required"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    coverImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
  }
);

// Create indices for faster queries
CollectionSchema.index({ owner: 1 });
CollectionSchema.index({ isPublic: 1 });
CollectionSchema.index({ name: "text", description: "text" }); // Text index for search

// Create Collection model
const Collection = mongoose.models.Collection || mongoose.model<ICollection>("Collection", CollectionSchema);

export default Collection; 