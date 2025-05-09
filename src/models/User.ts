import mongoose, { Schema, Document } from "mongoose";

// Define the interface for User document
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  bio?: string;
  location?: string;
  website?: string;
  emailVerified?: Date;
  sessionVersion?: number;
  preferences?: {
    theme?: string;
    defaultPrivacy?: 'public' | 'private';
    galleryView?: 'grid' | 'masonry';
    itemsPerPage?: number;
    autoMetadataStrip?: boolean;
    showPublicGallery?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Add privacy settings to the preferences schema
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultPrivacy: 'public' | 'private';
  galleryView: 'grid' | 'masonry';
  itemsPerPage: number;
  autoMetadataStrip: boolean;
  showPublicGallery: boolean; // Whether user's public gallery is discoverable
}

// Default values for user preferences with privacy settings
export const defaultPreferences: UserPreferences = {
  theme: 'system',
  defaultPrivacy: 'private',
  galleryView: 'grid',
  itemsPerPage: 12,
  autoMetadataStrip: false,
  showPublicGallery: true,
};

// Define User schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      select: false, // Don't include password in default query results
    },
    image: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },
    location: {
      type: String,
      maxlength: [100, "Location cannot be more than 100 characters"],
    },
    website: {
      type: String,
      maxlength: [200, "Website URL cannot be more than 200 characters"],
    },
    emailVerified: {
      type: Date,
    },
    sessionVersion: {
      type: Number,
      default: 0,
    },
    preferences: {
      type: {
        theme: {
          type: String,
          enum: ['light', 'dark', 'system'],
          default: 'system'
        },
        defaultPrivacy: {
          type: String,
          enum: ['public', 'private'],
          default: 'private'
        },
        galleryView: {
          type: String,
          enum: ['grid', 'masonry'],
          default: 'grid'
        },
        itemsPerPage: {
          type: Number,
          default: 12
        },
        autoMetadataStrip: {
          type: Boolean,
          default: false
        },
        showPublicGallery: {
          type: Boolean,
          default: true
        }
      },
      default: defaultPreferences,
    },
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
  }
);

// Create User model (only on the server, not in the browser)
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User; 