import { useCallback, useEffect, useMemo, useState } from "react";

import {
  disconnectGitHubAccount as disconnectGitHubAccountRequest,
  getCurrentUser,
  updateProfile as updateProfileRequest,
} from "../utils/api";
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

function updateStoredUser(token, user) {
  const storageOptions = [window.localStorage, window.sessionStorage];

  for (const storage of storageOptions) {
    if (storage.getItem(AUTH_TOKEN_KEY) === token) {
      storage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      return;
    }
  }
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

  const signIn = useCallback(({ token, user, rememberMe = false }) => {
    const selectedStorage = rememberMe
      ? window.localStorage
      : window.sessionStorage;

    clearAllAuthStorage();

    selectedStorage.setItem(AUTH_TOKEN_KEY, token);
    selectedStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

    setAuthSession({
      token,
      user,
    });
  }, []);

  const signOut = useCallback(() => {
    clearAllAuthStorage();
    setAuthSession(null);
  }, []);

  const updateCurrentUser = useCallback(
    async ({ fullName, email }) => {
      const token = authSession?.token;

      if (!token) {
        throw new Error("You must be signed in to update your profile.");
      }

      const response = await updateProfileRequest({
        token,
        fullName,
        email,
      });

      if (!response?.user) {
        throw new Error("The server returned an incomplete profile response.");
      }

      updateStoredUser(token, response.user);

      setAuthSession((currentSession) => {
        if (!currentSession || currentSession.token !== token) {
          return currentSession;
        }

        return {
          ...currentSession,
          user: response.user,
        };
      });

      return response;
    },
    [authSession?.token],
  );

  const refreshCurrentUser = useCallback(async () => {
    const token = authSession?.token;

    if (!token) {
      throw new Error("You must be signed in to refresh your profile.");
    }

    const response = await getCurrentUser(token);

    if (!response?.user) {
      throw new Error("The server returned an incomplete user response.");
    }

    updateStoredUser(token, response.user);

    setAuthSession((currentSession) => {
      if (!currentSession || currentSession.token !== token) {
        return currentSession;
      }

      return {
        ...currentSession,
        user: response.user,
      };
    });

    return response;
  }, [authSession?.token]);

  const disconnectGitHubAccount = useCallback(async () => {
    const token = authSession?.token;

    if (!token) {
      throw new Error("You must be signed in to disconnect GitHub.");
    }

    const response = await disconnectGitHubAccountRequest(token);

    if (!response?.user) {
      throw new Error("The server returned an incomplete user response.");
    }

    updateStoredUser(token, response.user);

    setAuthSession((currentSession) => {
      if (!currentSession || currentSession.token !== token) {
        return currentSession;
      }

      return {
        ...currentSession,
        user: response.user,
      };
    });

    return response;
  }, [authSession?.token]);

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
        const response = await getCurrentUser(storedSession.token);

        if (!response?.user) {
          throw new Error("The server returned an incomplete user response.");
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
      isAuthenticated: Boolean(authSession?.token && authSession?.user),
      isAuthLoading,
      signIn,
      signOut,
      updateCurrentUser,
      refreshCurrentUser,
      disconnectGitHubAccount,
    }),
    [
      authSession,
      isAuthLoading,
      signIn,
      signOut,
      updateCurrentUser,
      refreshCurrentUser,
      disconnectGitHubAccount,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export default AuthProvider;
