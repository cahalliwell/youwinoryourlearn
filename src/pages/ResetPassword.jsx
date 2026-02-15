import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { palette, theme } from "../config/theme";
import { signOut, updatePassword } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { loginGradientColors, loginStyles } from "./authShared";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigation = useNavigation();
  const { completePasswordResetFlow } = useAuth();

  const backToLogin = useCallback(async () => {
    completePasswordResetFlow();
    await signOut();
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }));
  }, [completePasswordResetFlow, navigation]);

  const handleReset = useCallback(async () => {
    const trimmed = newPassword.trim();
    const confirm = confirmPassword.trim();
    if (!trimmed || !confirm) {
      Alert.alert("Missing password", "Please enter and confirm your new password.");
      return;
    }
    if (trimmed.length < 8) {
      Alert.alert("Password too short", "Passwords must be at least 8 characters.");
      return;
    }
    if (trimmed !== confirm) {
      Alert.alert("Passwords do not match", "Ensure both passwords match before continuing.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await updatePassword({ password: trimmed });
      if (error) throw error;
      await backToLogin();
      Alert.alert("Password updated", "Please sign in with your new password.");
    } catch (error) {
      Alert.alert("Unable to reset password", error?.message || "Request a new reset email and try again.");
    } finally {
      setSubmitting(false);
    }
  }, [backToLogin, confirmPassword, newPassword]);

  return (
    <LinearGradient colors={loginGradientColors} style={loginStyles.gradient} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={loginStyles.container} keyboardShouldPersistTaps="handled">
            <View style={loginStyles.card}>
              <View style={loginStyles.titleRow}>
                <Ionicons name="refresh-outline" size={28} color={palette.goldDeep} />
                <Text style={loginStyles.title}>Reset Your Password</Text>
              </View>
              <Text style={loginStyles.subtitle}>Choose a new password for your account.</Text>
              <Text style={loginStyles.label}>New Password</Text>
              <TextInput value={newPassword} onChangeText={setNewPassword} placeholder="Enter a secure password" placeholderTextColor={palette.inkMuted} secureTextEntry textContentType="newPassword" style={loginStyles.input} />
              <Text style={loginStyles.label}>Confirm New Password</Text>
              <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter your new password" placeholderTextColor={palette.inkMuted} secureTextEntry textContentType="newPassword" style={loginStyles.input} />
              <Pressable style={[loginStyles.button, loginStyles.buttonPrimary, { marginTop: 16, marginHorizontal: 0 }]} onPress={handleReset} disabled={submitting}>
                {submitting ? <ActivityIndicator color={palette.white} /> : <Text style={loginStyles.buttonTextPrimary}>Update password</Text>}
              </Pressable>
              <Pressable onPress={backToLogin} style={{ marginTop: theme.space(1) }}>
                <Text style={[loginStyles.helperText, { color: palette.goldDeep }]}>Back to Login</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
