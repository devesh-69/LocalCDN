import mongoose, { Schema, Document } from "mongoose";

/**
 * Enum for change types
 */
export enum ChangeType {
  EDIT = 'edit',
  STRIP = 'strip',
  RESTORE = 'restore',
  INITIAL = 'initial',
}

/**
 * Interface for MetadataVersion document
 */
export interface IMetadataVersion extends Document {
  imageId: mongoose.Types.ObjectId;
  createdAt: Date;
  author?: string;
  metadata: Record<string, any>;
  changeType: string;
  description?: string;
}

/**
 * Schema for MetadataVersion
 */
const MetadataVersionSchema = new Schema<IMetadataVersion>({
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  author: {
    type: String,
    required: false,
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: true,
  },
  changeType: {
    type: String,
    enum: Object.values(ChangeType),
    default: ChangeType.EDIT,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

// Create indices for faster queries
MetadataVersionSchema.index({ imageId: 1, createdAt: -1 });
MetadataVersionSchema.index({ author: 1 });
MetadataVersionSchema.index({ changeType: 1 });

// Export the model
const MetadataVersion = mongoose.models.MetadataVersion as mongoose.Model<IMetadataVersion> || 
  mongoose.model<IMetadataVersion>('MetadataVersion', MetadataVersionSchema);

export default MetadataVersion; 