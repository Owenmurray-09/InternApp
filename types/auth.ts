import type { Session, User } from '@supabase/supabase-js';

// Simple auth state machine
export type AuthStatus = 'loading' | 'unauthenticated' | 'student' | 'employer';

// User profile with role
export interface UserProfile {
  id: string;
  role: 'student' | 'employer';
  name?: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatar_url?: string;
}

// Complete auth state
export interface AuthState {
  status: AuthStatus;
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
}

// Auth context interface
export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}