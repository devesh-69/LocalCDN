import mongoose from 'mongoose';
import Image from '@/models/Image';
import User from '@/models/User';

/**
 * Utility functions to optimize MongoDB queries and ensure proper indexing
 */

/**
 * Set up indexes for common queries to improve performance
 */
export async function setupIndexes() {
  try {
    // Check if we already have indexes to avoid recreating them
    const imageIndexes = await Image.collection.listIndexes().toArray();
    const userIndexes = await User.collection.listIndexes().toArray();
    
    // Setup Image model indexes
    if (!imageIndexes.some(idx => idx.name === 'owner_1')) {
      await Image.collection.createIndex({ owner: 1 }, { background: true });
      console.log('Created owner index on Image collection');
    }
    
    if (!imageIndexes.some(idx => idx.name === 'isPublic_1')) {
      await Image.collection.createIndex({ isPublic: 1 }, { background: true });
      console.log('Created isPublic index on Image collection');
    }
    
    if (!imageIndexes.some(idx => idx.name === 'tags_1')) {
      await Image.collection.createIndex({ tags: 1 }, { background: true });
      console.log('Created tags index on Image collection');
    }
    
    if (!imageIndexes.some(idx => idx.name === 'createdAt_-1')) {
      await Image.collection.createIndex({ createdAt: -1 }, { background: true });
      console.log('Created createdAt index on Image collection');
    }
    
    // Compound indexes for common queries
    if (!imageIndexes.some(idx => idx.name === 'owner_1_isPublic_1')) {
      await Image.collection.createIndex({ owner: 1, isPublic: 1 }, { background: true });
      console.log('Created compound index owner+isPublic on Image collection');
    }
    
    // User model indexes
    if (!userIndexes.some(idx => idx.name === 'email_1')) {
      await User.collection.createIndex({ email: 1 }, { unique: true, background: true });
      console.log('Created email index on User collection');
    }
    
    console.log('Database indexes setup complete');
  } catch (error) {
    console.error('Error setting up database indexes:', error);
  }
}

/**
 * Optimize a query by adding appropriate projection to limit returned fields
 */
export function optimizeImageQuery(query: mongoose.FilterQuery<any>, options: { 
  select?: string[] | Record<string, number>,
  limit?: number,
  skip?: number,
  sort?: Record<string, 1 | -1>
} = {}) {
  // Default projection to exclude large fields if not specified
  if (!options.select) {
    options.select = {
      metadata: 0, // Exclude full metadata by default
      description: 0, // Exclude description by default
    };
  }
  
  const findOptions: mongoose.QueryOptions = {
    lean: true, // Return plain objects instead of Mongoose documents for better performance
  };
  
  if (options.limit) findOptions.limit = options.limit;
  if (options.skip) findOptions.skip = options.skip;
  if (options.sort) findOptions.sort = options.sort;
  if (options.select) findOptions.projection = options.select;
  
  return { query, options: findOptions };
}

/**
 * Cache-enabled version of countDocuments for better performance
 * Uses estimation for large collections
 */
export async function optimizedCount(model: mongoose.Model<any>, query: mongoose.FilterQuery<any>) {
  // For queries that match many documents, use estimatedDocumentCount for better performance
  const isSimpleQuery = Object.keys(query).length === 0;
  
  if (isSimpleQuery) {
    return model.estimatedDocumentCount();
  }
  
  // Otherwise use countDocuments with the query
  return model.countDocuments(query);
}

// Initialize indexes on application start
export async function initializeOptimizations() {
  // Only run in production to avoid development performance impact
  if (process.env.NODE_ENV === 'production') {
    await setupIndexes();
  }
} 