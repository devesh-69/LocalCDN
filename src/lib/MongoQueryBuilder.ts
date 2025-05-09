/**
 * Utility class for building MongoDB queries
 * This helps create consistent, reusable query patterns
 */
export class MongoQueryBuilder {
  private query: Record<string, any> = {};
  
  /**
   * Add a simple field-value condition to the query
   * @param field Field name to query
   * @param value Value to match
   * @returns This builder instance for chaining
   */
  addCondition(field: string, value: any): MongoQueryBuilder {
    this.query[field] = value;
    return this;
  }
  
  /**
   * Add $or conditions to the query
   * @param conditions Array of condition objects to OR together
   * @returns This builder instance for chaining
   */
  addOr(conditions: Record<string, any>[]): MongoQueryBuilder {
    if (!this.query.$or) {
      this.query.$or = [];
    }
    
    this.query.$or.push(...conditions);
    return this;
  }
  
  /**
   * Add $and conditions to the query
   * @param conditions Array of condition objects to AND together
   * @returns This builder instance for chaining
   */
  addAnd(conditions: Record<string, any>[]): MongoQueryBuilder {
    if (!this.query.$and) {
      this.query.$and = [];
    }
    
    this.query.$and.push(...conditions);
    return this;
  }
  
  /**
   * Add $text search condition to the query
   * @param text Text to search for
   * @returns This builder instance for chaining
   */
  addTextSearch(text: string): MongoQueryBuilder {
    this.query.$text = { $search: text };
    return this;
  }
  
  /**
   * Add regex search for partial matching
   * @param field Field to search in
   * @param term Term to search for
   * @param options Regex options (default: case-insensitive)
   * @returns This builder instance for chaining
   */
  addRegexSearch(field: string, term: string, options: string = 'i'): MongoQueryBuilder {
    this.query[field] = { $regex: term, $options: options };
    return this;
  }
  
  /**
   * Add date range condition
   * @param field Date field name
   * @param startDate Start date (optional)
   * @param endDate End date (optional)
   * @returns This builder instance for chaining
   */
  addDateRange(field: string, startDate?: Date, endDate?: Date): MongoQueryBuilder {
    if (startDate || endDate) {
      this.query[field] = {};
      
      if (startDate) {
        this.query[field].$gte = startDate;
      }
      
      if (endDate) {
        this.query[field].$lte = endDate;
      }
    }
    
    return this;
  }
  
  /**
   * Add numeric range condition
   * @param field Numeric field name
   * @param min Minimum value (optional)
   * @param max Maximum value (optional) 
   * @returns This builder instance for chaining
   */
  addNumericRange(field: string, min?: number, max?: number): MongoQueryBuilder {
    if (min !== undefined || max !== undefined) {
      this.query[field] = {};
      
      if (min !== undefined) {
        this.query[field].$gte = min;
      }
      
      if (max !== undefined) {
        this.query[field].$lte = max;
      }
    }
    
    return this;
  }
  
  /**
   * Add an $in condition for matching against an array of values
   * @param field Field name
   * @param values Array of values to match against
   * @returns This builder instance for chaining
   */
  addInCondition(field: string, values: any[]): MongoQueryBuilder {
    if (values && values.length > 0) {
      this.query[field] = { $in: values };
    }
    
    return this;
  }
  
  /**
   * Add an $exists condition to check if a field exists
   * @param field Field name
   * @param exists Whether the field should exist (true) or not exist (false)
   * @returns This builder instance for chaining
   */
  addExistsCondition(field: string, exists: boolean = true): MongoQueryBuilder {
    this.query[field] = { $exists: exists };
    return this;
  }
  
  /**
   * Build and return the final MongoDB query object
   * @returns The constructed query object
   */
  build(): Record<string, any> {
    return this.query;
  }
} 