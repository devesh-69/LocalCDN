/**
 * Application monitoring and error tracking utilities
 * This module can be connected to external monitoring services
 * like Sentry, LogRocket, or custom solutions
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type ErrorCategory = 'api' | 'auth' | 'db' | 'ui' | 'upload' | 'network' | 'other';

interface ErrorEvent {
  message: string;
  stack?: string;
  category: ErrorCategory;
  metadata?: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

interface PerformanceEvent {
  name: string;
  duration: number;
  metadata?: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

class Monitoring {
  private static instance: Monitoring;
  private errors: ErrorEvent[] = [];
  private performanceEvents: PerformanceEvent[] = [];
  private isEnabled: boolean = false;
  private shouldConsoleLog: boolean = true;
  private bufferSize: number = 100;
  private apiEndpoint?: string;
  private currentUser?: { id: string; email?: string };
  
  private constructor() {
    // Initialize based on environment
    this.isEnabled = process.env.NODE_ENV === 'production';
    this.apiEndpoint = process.env.MONITORING_API_ENDPOINT;
    
    // Set up error listener for uncaught errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): Monitoring {
    if (!Monitoring.instance) {
      Monitoring.instance = new Monitoring();
    }
    return Monitoring.instance;
  }
  
  /**
   * Set the current user for context in logs
   */
  public setUser(user: { id: string; email?: string } | null): void {
    this.currentUser = user || undefined;
  }
  
  /**
   * Log an error
   */
  public error(
    message: string | Error,
    category: ErrorCategory = 'other',
    metadata?: Record<string, any>
  ): void {
    const errorMessage = message instanceof Error ? message.message : message;
    const errorStack = message instanceof Error ? message.stack : undefined;
    
    const errorEvent: ErrorEvent = {
      message: errorMessage,
      stack: errorStack,
      category,
      metadata,
      timestamp: new Date(),
      userId: this.currentUser?.id,
    };
    
    // Add to buffer (with size limit)
    this.errors.push(errorEvent);
    if (this.errors.length > this.bufferSize) {
      this.errors.shift();
    }
    
    // Console log in development
    if (this.shouldConsoleLog) {
      console.error(`[${category.toUpperCase()}] ${errorMessage}`, metadata);
    }
    
    // Send to API in production
    if (this.isEnabled && this.apiEndpoint) {
      this.sendErrorToApi(errorEvent).catch(e => {
        console.error('Failed to send error to monitoring API:', e);
      });
    }
  }
  
  /**
   * Log a performance event
   */
  public logPerformance(
    name: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const event: PerformanceEvent = {
      name,
      duration,
      metadata,
      timestamp: new Date(),
      userId: this.currentUser?.id,
    };
    
    // Add to buffer (with size limit)
    this.performanceEvents.push(event);
    if (this.performanceEvents.length > this.bufferSize) {
      this.performanceEvents.shift();
    }
    
    // Console log in development
    if (this.shouldConsoleLog) {
      console.log(`[PERFORMANCE] ${name}: ${duration}ms`, metadata);
    }
    
    // Send to API in production
    if (this.isEnabled && this.apiEndpoint) {
      this.sendPerformanceToApi(event).catch(e => {
        console.error('Failed to send performance data to monitoring API:', e);
      });
    }
  }
  
  /**
   * Start a performance measurement
   */
  public startMeasure(name: string): () => void {
    const start = performance.now();
    
    return (metadata?: Record<string, any>) => {
      const duration = performance.now() - start;
      this.logPerformance(name, duration, metadata);
    };
  }
  
  /**
   * Handle global uncaught errors
   */
  private handleGlobalError(event: ErrorEvent): void {
    this.error(
      event.error || event.message,
      'other',
      {
        line: event.lineno,
        column: event.colno,
        filename: event.filename,
      }
    );
  }
  
  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    this.error(error, 'other', { unhandledRejection: true });
  }
  
  /**
   * Send error to monitoring API
   */
  private async sendErrorToApi(error: ErrorEvent): Promise<void> {
    if (!this.apiEndpoint) return;
    
    try {
      await fetch(`${this.apiEndpoint}/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      });
    } catch (error) {
      // Fail silently, but log to console
      console.error('Failed to send error to monitoring API:', error);
    }
  }
  
  /**
   * Send performance data to monitoring API
   */
  private async sendPerformanceToApi(event: PerformanceEvent): Promise<void> {
    if (!this.apiEndpoint) return;
    
    try {
      await fetch(`${this.apiEndpoint}/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      // Fail silently, but log to console
      console.error('Failed to send performance data to monitoring API:', error);
    }
  }
  
  /**
   * Get all logged errors (for debugging)
   */
  public getErrors(): ErrorEvent[] {
    return [...this.errors];
  }
  
  /**
   * Get all performance events (for debugging)
   */
  public getPerformanceEvents(): PerformanceEvent[] {
    return [...this.performanceEvents];
  }
  
  /**
   * Clear all logs (for testing)
   */
  public clearLogs(): void {
    this.errors = [];
    this.performanceEvents = [];
  }
  
  /**
   * Toggle console logging
   */
  public setConsoleLogging(enabled: boolean): void {
    this.shouldConsoleLog = enabled;
  }
}

// Export singleton instance
export const monitoring = Monitoring.getInstance();

// Performance measurement utility function
export function measurePerformance<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    const duration = performance.now() - start;
    monitoring.logPerformance(name, duration, metadata);
  }
}

// Async performance measurement utility function
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const duration = performance.now() - start;
    monitoring.logPerformance(name, duration, metadata);
  }
} 