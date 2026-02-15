import { supabase } from "./supabase";

export const signInWithPassword = ({ email, password }) =>
  supabase.auth.signInWithPassword({ email, password });

export const signUpWithPassword = ({ email, password }) =>
  supabase.auth.signUp({ email, password });

export const signOut = () => supabase.auth.signOut();

export const requestPasswordReset = ({ email, redirectTo }) =>
  supabase.auth.resetPasswordForEmail(email, { redirectTo });

export const updatePassword = ({ password }) =>
  supabase.auth.updateUser({ password });

export const fetchSession = () => supabase.auth.getSession();

export const exchangeSessionFromUrl = (url) =>
  supabase.auth.getSessionFromUrl({ url, storeSession: true });

export const subscribeToAuthChanges = (callback) => supabase.auth.onAuthStateChange(callback);
