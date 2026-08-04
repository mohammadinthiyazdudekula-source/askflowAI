import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../services/supabaseService';

export interface AuthenticatedUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      token?: string;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If authorization header missing in unconfigured local demo mode, create mock user
    if (!isSupabaseConfigured()) {
      req.user = {
        id: 'demo-user-id-123',
        email: 'demo@askflow.ai',
        user_metadata: { full_name: 'Demo User' },
      };
      req.token = 'demo-token';
      return next();
    }
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  req.token = token;

  if (!isSupabaseConfigured()) {
    // Supabase URL/Key not set in .env yet
    req.user = {
      id: 'demo-user-id-123',
      email: 'demo@askflow.ai',
      user_metadata: { full_name: 'Demo User' },
    };
    return next();
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email || '',
      user_metadata: data.user.user_metadata,
    };
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication verification failed' });
  }
}
