import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import * as ExpoLinking from "expo-linking";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { palette, theme } from "../config/theme";
import { requestPasswordReset } from "../services/auth";
import { loginGradientColors, loginStyles } from "./authShared";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigation = useNavigation();

  const handleSendReset = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert("Missing email", "Please enter the email linked to your account.");
      return;
    }

    setSubmitting(true);
    try {
      const redirectTo = ExpoLinking.createURL("auth/reset");
      const { error } = await requestPasswordReset({ email: trimmed, redirectTo });
      if (error) throw error;
      Alert.alert("Check your email", "We sent a password reset link. Open it on this device to continue.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Reset failed", error?.message || "Unable to send reset email right now.");
    } finally {
      setSubmitting(false);
    }
  }, [email, navigation]);

  return (
    <LinearGradient colors={loginGradientColors} style={loginStyles.gradient} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={loginStyles.container} keyboardShouldPersistTaps="handled">
            <View style={loginStyles.card}>
              <View style={loginStyles.titleRow}>
                <Ionicons name="mail-unread-outline" size={28} color={palette.goldDeep} />
                <Text style={loginStyles.title}>Forgot Password</Text>
              </View>
              <Text style={loginStyles.subtitle}>Enter your email to receive a reset link.</Text>
              <Text style={loginStyles.label}>Email</Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={palette.inkMuted} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" style={loginStyles.input} />
              <Pressable style={[loginStyles.button, loginStyles.buttonPrimary, { marginTop: 16, marginHorizontal: 0 }]} onPress={handleSendReset} disabled={submitting}>
                {submitting ? <ActivityIndicator color={palette.white} /> : <Text style={loginStyles.buttonTextPrimary}>Send reset link</Text>}
              </Pressable>
              <Pressable onPress={() => navigation.goBack()} style={{ marginTop: theme.space(1) }}>
                <Text style={[loginStyles.helperText, { color: palette.goldDeep }]}>Back to Login</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
