import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCurrentUser } from "../utils/api";
import AuthContext from "./AuthContext";

const AUTH_TOKEN_KEY = "skillforgeAuthToken";
const AUTH_USER_KEY = "skillforgeAuthUser";

function clearStorage(storage) {
  storage.removeItem(AUTH_TOKEN_KEY);
  storage.removeItem(AUTH_USER_KEY);
}

function clearAllAuthStorage() {
  clearStorage(window.localStorage);
  clearStorage(window.sessionStorage);
}

function readStoredSession() {
  const storageOptions = [
    {
      storage: window.localStorage,
      rememberMe: true,
    },
    {
      storage: window.sessionStorage,
      rememberMe: false,
    },
  ];

  for (const { storage, rememberMe } of storageOptions) {
    const token = storage.getItem(AUTH_TOKEN_KEY);
    const storedUser = storage.getItem(AUTH_USER_KEY);

    if (!token || !storedUser) {
      if (token || storedUser) {
        clearStorage(storage);
      }

      continue;
    }

    try {
      return {
        token,
        user: JSON.parse(storedUser),
        rememberMe,
      };
    } catch {
      clearStorage(storage);
    }
  }

  return null;
}

function AuthProvider({ children }) {
  const [authSession, setAuthSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const signIn = useCallback(
    ({ token, user, rememberMe = false }) => {
      const selectedStorage = rememberMe
        ? window.localStorage
        : window.sessionStorage;

      clearAllAuthStorage();

      selectedStorage.setItem(AUTH_TOKEN_KEY, token);
      selectedStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(user),
      );

      setAuthSession({
        token,
        user,
      });
    },
    [],
  );

  const signOut = useCallback(() => {
    clearAllAuthStorage();
    setAuthSession(null);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      const storedSession = readStoredSession();

      if (!storedSession) {
        if (isActive) {
          setIsAuthLoading(false);
        }

        return;
      }

      try {
        const response = await getCurrentUser(
          storedSession.token,
        );

        if (!response?.user) {
          throw new Error(
            "The server returned an incomplete user response.",
          );
        }

        if (!isActive) {
          return;
        }

        signIn({
          token: storedSession.token,
          user: response.user,
          rememberMe: storedSession.rememberMe,
        });
      } catch {
        if (!isActive) {
          return;
        }

        clearAllAuthStorage();
        setAuthSession(null);
      } finally {
        if (isActive) {
          setIsAuthLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isActive = false;
    };
  }, [signIn]);

  const contextValue = useMemo(
    () => ({
      token: authSession?.token || null,
      currentUser: authSession?.user || null,
      isAuthenticated: Boolean(
        authSession?.token && authSession?.user,
      ),
      isAuthLoading,
      signIn,
      signOut,
    }),
    [authSession, isAuthLoading, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
