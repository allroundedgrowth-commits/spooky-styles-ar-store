import { Request, Response, NextFunction } from 'express';
import { createSupabaseClientWithAuth } from '../config/supabase.js';
import { SupabaseClient } from '@supabase/supabase-js';

// Extend Express Request to include Supabase client
declare global {
  namespace Express {
    interface Request {
      supabase?: SupabaseClient;
    }
  }
}

/**
 * Middleware to attach Supabase client with user JWT to request
 * This enables Row Level Security (RLS) enforcement for the authenticated user
 * 
 * Usage: Apply this middleware to routes that need RLS enforcement
 * The middleware extracts the JWT from the Authorization header and creates
 * a Supabase client that will enforce RLS policies for that user
 */
export const supabaseAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract JWT token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - continue without Supabase client
      // This allows public routes to work
      return next();
    }

    const jwtToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create Supabase client with user's JWT for RLS enforcement
    req.supabase = createSupabaseClientWithAuth(jwtToken);

    next();
  } catch (error) {
    console.error('Supabase auth middleware error:', error);
    // Don't block the request, just log the error
    next();
  }
};

export default supabaseAuthMiddleware;
