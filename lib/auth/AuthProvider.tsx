import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, type AuthState, type AuthActions } from '@/lib/hooks/useAuth';

// Auth context type - combination of state and actions
type AuthContextType = AuthState & AuthActions;

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

// Re-export for convenience
export { type AuthState, type AuthActions } from '@/lib/hooks/useAuth';