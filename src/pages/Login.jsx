import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { palette, theme } from "../config/theme";
import { signInWithPassword } from "../services/auth";
import { loginGradientColors, loginStyles } from "./authShared";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigation = useNavigation();

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing information", "Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    } catch (error) {
      Alert.alert("Login failed", error?.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [email, password]);

  return (
    <LinearGradient colors={loginGradientColors} style={loginStyles.gradient} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={loginStyles.container} keyboardShouldPersistTaps="handled">
            <View style={loginStyles.card}>
              <View style={loginStyles.titleRow}>
                <Ionicons name="sparkles-outline" size={28} color={palette.goldDeep} />
                <Text style={loginStyles.title}>Welcome Back</Text>
              </View>
              <Text style={loginStyles.subtitle}>Sign in to continue your journey with the I Ching.</Text>

              <Text style={loginStyles.label}>Email</Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={palette.inkMuted} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" style={loginStyles.input} />

              <Text style={loginStyles.label}>Password</Text>
              <TextInput value={password} onChangeText={setPassword} placeholder="Enter your password" placeholderTextColor={palette.inkMuted} secureTextEntry autoCapitalize="none" textContentType="password" style={loginStyles.input} />

              <Pressable onPress={() => navigation.navigate("ForgotPassword")} style={{ marginTop: theme.space(1) }}>
                <Text style={[loginStyles.helperText, { color: palette.goldDeep }]}>Forgot password?</Text>
              </Pressable>

              <View style={loginStyles.buttonRow}>
                <Pressable style={[loginStyles.button, loginStyles.buttonSecondary]} onPress={() => navigation.navigate("Signup")} disabled={submitting}>
                  <Text style={loginStyles.buttonTextSecondary}>Sign Up</Text>
                </Pressable>
                <Pressable style={[loginStyles.button, loginStyles.buttonPrimary]} onPress={handleLogin} disabled={submitting}>
                  {submitting ? <ActivityIndicator color={palette.white} /> : <Text style={loginStyles.buttonTextPrimary}>Login</Text>}
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
