import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const AuthContext = createContext(null);
const DEV_USER = { uid: 'localhost-dev', email: 'debug@test.com', displayName: 'Debug' };

function shouldUseDevUser() {
  if (!import.meta.env.DEV) return false;
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem('ortho_disable_dev_auth') !== '1';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(shouldUseDevUser() ? DEV_USER : null);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(import.meta.env.DEV);
  const unsubscribeRef = useRef(null);
  const authPromiseRef = useRef(null);

  const ensureAuth = useCallback(() => {
    if (import.meta.env.DEV) {
      const devUserEnabled = shouldUseDevUser();
      const nextUser = devUserEnabled ? DEV_USER : null;
      setUser(nextUser);
      setAuthReady(true);
      setLoading(false);
      return Promise.resolve(nextUser);
    }
    if (authReady) return Promise.resolve(user);
    if (authPromiseRef.current) return authPromiseRef.current;

    setLoading(true);
    authPromiseRef.current = Promise.all([
      import('firebase/auth'),
      import('../services/firebase-auth.js'),
    ]).then(([{ onAuthStateChanged }, { auth }]) => {
      unsubscribeRef.current = onAuthStateChanged(auth, (firebaseUser) => {
        import('../services/analytics.js').then(({ default: posthog }) => {
          if (firebaseUser) {
            posthog.identify(firebaseUser.uid, {
              email: firebaseUser.email,
              name: firebaseUser.displayName,
            });
          } else {
            posthog.reset();
          }
        }).catch(() => {});

        setUser(firebaseUser);
        setAuthReady(true);
        setLoading(false);
      });
    }).catch((error) => {
      console.warn('Firebase auth init failed:', error);
      setAuthReady(true);
      setLoading(false);
    });
    return authPromiseRef.current;
  }, [authReady, user]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  async function signOut() {
    const [{ signOut: firebaseSignOut }, { auth }] = await Promise.all([
      import('firebase/auth'),
      import('../services/firebase-auth.js'),
    ]);
    await firebaseSignOut(auth);
    setUser(null);
    setAuthReady(true);
    import('../services/analytics.js').then(({ default: posthog }) => posthog.reset()).catch(() => {});
  }

  return (
    <AuthContext.Provider value={{ user, loading, authReady, ensureAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
