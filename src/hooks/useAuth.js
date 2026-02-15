import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, Linking } from "react-native";
import * as ExpoLinking from "expo-linking";
import {
  exchangeSessionFromUrl,
  fetchSession,
  signOut as signOutRequest,
  subscribeToAuthChanges,
} from "../services/auth";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthContext provider");
  }
  return ctx;
}

export function useAuthController() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [passwordResetRequested, setPasswordResetRequested] = useState(false);

  const completePasswordResetFlow = useCallback(() => {
    setPasswordResetRequested(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    console.log("🔐 Auth hydration: fetching initial session...");

    fetchSession()
      .then(({ data }) => {
        if (!isMounted) return;
        console.log(
          "🔐 Auth hydration result:",
          data?.session ? "session restored" : "no session",
          data?.session?.user ? "user present" : "no user"
        );
        setSession(data?.session ?? null);
        setAuthReady(true);
        console.log("🔐 Auth hydration complete: authReady set to true");
      })
      .catch((error) => {
        console.log("Session fetch error:", error?.message || error);
        if (isMounted) {
          setAuthReady(true);
          console.log("🔐 Auth hydration failed: authReady set to true");
        }
      });

    const {
      data: { subscription },
    } = subscribeToAuthChanges((event, newSession) => {
      console.log("🔐 Auth state change:", event, "session?", !!newSession, "user?", !!newSession?.user);
      if (event === "SIGNED_OUT") {
        setSession(null);
      } else if (newSession !== null) {
        setSession(newSession);
      }
      setAuthReady(true);
      if (event === "PASSWORD_RECOVERY") {
        setPasswordResetRequested(true);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const processResetLink = async (url) => {
      if (!url || !url.includes("/auth/reset")) return;
      console.log("🔗 Incoming reset link:", url);
      setPasswordResetRequested(true);
      const { data, error } = await exchangeSessionFromUrl(url);

      if (error) {
        console.log("❌ Supabase password recovery failed:", error.message);
        setPasswordResetRequested(false);
        Alert.alert("Password reset", "We couldn't open that link. Please request a new reset email.");
        return;
      }

      if (data?.session) {
        setSession(data.session);
      }
      console.log("✅ Supabase password recovery session established");
    };

    const processAuthCallbackLink = async (url) => {
      if (!url || !url.includes("auth/callback")) return;
      console.log("🔗 Handling auth callback link:", url);
      const { error } = await exchangeSessionFromUrl(url);
      if (error) {
        console.log("Auth callback link error:", error?.message || error);
      }
    };

    const sub = Linking.addEventListener("url", async ({ url }) => {
      await processResetLink(url);
      await processAuthCallbackLink(url);
    });

    const resolveInitialUrl = async () => {
      try {
        const initialUrl = await ExpoLinking.getInitialURL();
        if (initialUrl) {
          console.log("🔗 Initial link:", initialUrl);
          await processResetLink(initialUrl);
          await processAuthCallbackLink(initialUrl);
        }
      } catch (error) {
        console.log("Initial URL error:", error?.message || error);
      }
    };

    resolveInitialUrl();

    return () => sub.remove();
  }, []);

  const signOut = useCallback(async () => {
    await signOutRequest();
  }, []);

  return useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      authReady,
      loading: !authReady,
      signOut,
      passwordResetRequested,
      completePasswordResetFlow,
    }),
    [authReady, completePasswordResetFlow, passwordResetRequested, session, signOut]
  );
}

export function AuthProvider({ value, children }) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
