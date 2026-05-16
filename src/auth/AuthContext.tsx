import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CognitoUser,
  CognitoUserSession,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import { userPool } from './cognitoConfig';

interface AuthState {
  user: CognitoUser | null;
  session: CognitoUserSession | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (username: string, password: string) => Promise<CognitoUserSession>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, loading: true });

  useEffect(() => {
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      setState({ user: null, session: null, loading: false });
      return;
    }
    currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) {
        setState({ user: null, session: null, loading: false });
      } else {
        setState({ user: currentUser, session, loading: false });
      }
    });
  }, []);

  const signIn = (username: string, password: string): Promise<CognitoUserSession> =>
    new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: username, Pool: userPool });
      const authDetails = new AuthenticationDetails({ Username: username, Password: password });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          setState({ user: cognitoUser, session, loading: false });
          resolve(session);
        },
        onFailure: reject,
        newPasswordRequired: () =>
          reject(new Error('A new password is required. Please contact your administrator.')),
      });
    });

  const signOut = () => {
    state.user?.signOut();
    setState({ user: null, session: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
