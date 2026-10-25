import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  isFirebaseConfigured,
  FirebaseUser
} from '@/lib/firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'RIDER' | 'ADMIN';
  isAnonymous?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  isFirebaseConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string, role?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithDemoUser: (role?: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'RIDER' | 'ADMIN') => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, AppUser> = {
  CUSTOMER: {
    uid: 'demo-customer-123',
    email: 'alex.foodie@example.com',
    displayName: 'Alex Foodie',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'CUSTOMER'
  },
  RESTAURANT_OWNER: {
    uid: 'demo-chef-456',
    email: 'chef.mario@example.com',
    displayName: 'Executive Chef Mario',
    photoURL: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    role: 'RESTAURANT_OWNER'
  },
  CHEF: {
    uid: 'demo-chef-456',
    email: 'chef.mario@example.com',
    displayName: 'Executive Chef Mario',
    photoURL: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    role: 'RESTAURANT_OWNER'
  },
  RIDER: {
    uid: 'demo-rider-789',
    email: 'pilot.sam@dreamdrone.ai',
    displayName: 'Drone Pilot Sam',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'RIDER'
  },
  ADMIN: {
    uid: 'demo-admin-789',
    email: 'admin.super@dreamfood.com',
    displayName: 'Sarah Admin',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'ADMIN'
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved demo session in local storage first
    if (typeof window !== 'undefined') {
      const savedDemoUser = localStorage.getItem('dreamfood_demo_user');
      if (savedDemoUser) {
        try {
          setUser(JSON.parse(savedDemoUser));
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem('dreamfood_demo_user');
        }
      }
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'CUSTOMER'
        });
      } else {
        const savedDemoUser = typeof window !== 'undefined' ? localStorage.getItem('dreamfood_demo_user') : null;
        if (!savedDemoUser) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        // Fallback for immediate preview if Firebase keys not configured
        const demoUser: AppUser = {
          uid: `user-${Date.now()}`,
          email,
          displayName: email.split('@')[0],
          photoURL: null,
          role: 'CUSTOMER'
        };
        setUser(demoUser);
        localStorage.setItem('dreamfood_demo_user', JSON.stringify(demoUser));
        setLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string, role = 'CUSTOMER') => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        const demoUser: AppUser = {
          uid: `user-${Date.now()}`,
          email,
          displayName,
          photoURL: null,
          role: role as any
        };
        setUser(demoUser);
        localStorage.setItem('dreamfood_demo_user', JSON.stringify(demoUser));
        setLoading(false);
        return;
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (credential.user) {
        await updateProfile(credential.user, { displayName });
        setUser({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: displayName,
          photoURL: credential.user.photoURL,
          role: role as any
        });
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to create account.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        const demoUser = DEMO_USERS.CUSTOMER;
        setUser(demoUser);
        localStorage.setItem('dreamfood_demo_user', JSON.stringify(demoUser));
        setLoading(false);
        return;
      }

      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign in error:', err);
      setError(err.message || 'Failed to sign in with Google.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithDemoUser = async (role: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'RIDER' | 'ADMIN' = 'CUSTOMER') => {
    setLoading(true);
    setError(null);
    try {
      const demoUser = DEMO_USERS[role] || DEMO_USERS.CUSTOMER;
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('dreamfood_demo_user', JSON.stringify(demoUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dreamfood_demo_user');
      }
      if (auth) {
        await firebaseSignOut(auth);
      }
      setUser(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isFirebaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithDemoUser,
        signOut,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
