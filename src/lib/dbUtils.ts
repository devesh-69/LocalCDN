import mongoose, { Document, Model } from 'mongoose';
import { connectDB } from './db';

/**
 * Generic function to create a new document in the specified model
 */
export async function createDocument<T extends Document>(
  model: Model<T>,
  data: Partial<T>
): Promise<T> {
  try {
    await connectDB();
    const document = await model.create(data);
    return document;
  } catch (error) {
    console.error(`Error creating document in ${model.modelName}:`, error);
    throw error;
  }
}

/**
 * Generic function to find documents from the specified model
 */
export async function findDocuments<T extends Document>(
  model: Model<T>,
  query: any = {},
  options: {
    select?: string;
    populate?: string | { path: string; select?: string }[];
    sort?: string | Record<string, 1 | -1>;
    limit?: number;
    skip?: number;
  } = {}
): Promise<T[]> {
  try {
    await connectDB();
    
    let queryBuilder = model.find(query);
    
    // Apply select fields
    if (options.select) {
      queryBuilder = queryBuilder.select(options.select);
    }
    
    // Apply population
    if (options.populate) {
      queryBuilder = queryBuilder.populate(options.populate);
    }
    
    // Apply sorting
    if (options.sort) {
      queryBuilder = queryBuilder.sort(options.sort);
    }
    
    // Apply pagination
    if (options.limit) {
      queryBuilder = queryBuilder.limit(options.limit);
    }
    
    if (options.skip) {
      queryBuilder = queryBuilder.skip(options.skip);
    }
    
    const documents = await queryBuilder.exec();
    return documents;
  } catch (error) {
    console.error(`Error finding documents in ${model.modelName}:`, error);
    throw error;
  }
}

/**
 * Generic function to find a single document
 */
export async function findDocumentById<T extends Document>(
  model: Model<T>,
  id: string,
  options: {
    select?: string;
    populate?: string | { path: string; select?: string }[];
  } = {}
): Promise<T | null> {
  try {
    await connectDB();
    
    let queryBuilder = model.findById(id);
    
    // Apply select fields
    if (options.select) {
      queryBuilder = queryBuilder.select(options.select);
    }
    
    // Apply population
    if (options.populate) {
      queryBuilder = queryBuilder.populate(options.populate);
    }
    
    const document = await queryBuilder.exec();
    return document;
  } catch (error) {
    console.error(`Error finding document by ID in ${model.modelName}:`, error);
    throw error;
  }
}

/**
 * Generic function to update a document
 */
export async function updateDocument<T extends Document>(
  model: Model<T>,
  id: string,
  update: Partial<T>,
  options: {
    returnDocument?: 'before' | 'after';
    runValidators?: boolean;
  } = { returnDocument: 'after', runValidators: true }
): Promise<T | null> {
  try {
    await connectDB();
    
    const document = await model.findByIdAndUpdate(
      id,
      update,
      {
        new: options.returnDocument === 'after',
        runValidators: options.runValidators,
      }
    );
    
    return document;
  } catch (error) {
    console.error(`Error updating document in ${model.modelName}:`, error);
    throw error;
  }
}

/**
 * Generic function to delete a document
 */
export async function deleteDocument<T extends Document>(
  model: Model<T>,
  id: string
): Promise<T | null> {
  try {
    await connectDB();
    const document = await model.findByIdAndDelete(id);
    return document;
  } catch (error) {
    console.error(`Error deleting document in ${model.modelName}:`, error);
    throw error;
  }
}

/**
 * Generic function to count documents
 */
export async function countDocuments<T extends Document>(
  model: Model<T>,
  query: any = {}
): Promise<number> {
  try {
    await connectDB();
    const count = await model.countDocuments(query);
    return count;
  } catch (error) {
    console.error(`Error counting documents in ${model.modelName}:`, error);
    throw error;
  }
}

/**
 * Utility function to check if an ID is valid
 */
export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
} 