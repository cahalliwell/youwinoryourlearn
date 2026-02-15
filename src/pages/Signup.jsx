import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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
import { palette } from "../config/theme";
import { signUpWithPassword } from "../services/auth";
import { loginGradientColors, loginStyles } from "./authShared";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verificationDialogVisible, setVerificationDialogVisible] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const navigation = useNavigation();

  const handleSignup = useCallback(async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing information", "Please enter both email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await signUpWithPassword({ email: email.trim(), password });
      if (error) throw error;
      setPendingEmail(email.trim());
      setVerificationDialogVisible(true);
    } catch (error) {
      Alert.alert("Sign up failed", error?.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [email, password]);

  return (
    <>
      <LinearGradient colors={loginGradientColors} style={loginStyles.gradient} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={loginStyles.container} keyboardShouldPersistTaps="handled">
              <View style={loginStyles.card}>
                <View style={loginStyles.titleRow}>
                  <Ionicons name="person-add-outline" size={28} color={palette.goldDeep} />
                  <Text style={loginStyles.title}>Create Account</Text>
                </View>
                <Text style={loginStyles.subtitle}>Sign up to continue your journey with the I Ching.</Text>

                <Text style={loginStyles.label}>Email</Text>
                <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={palette.inkMuted} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" style={loginStyles.input} />

                <Text style={loginStyles.label}>Password</Text>
                <TextInput value={password} onChangeText={setPassword} placeholder="Enter your password" placeholderTextColor={palette.inkMuted} secureTextEntry autoCapitalize="none" textContentType="newPassword" style={loginStyles.input} />

                <View style={loginStyles.buttonRow}>
                  <Pressable style={[loginStyles.button, loginStyles.buttonSecondary]} onPress={() => navigation.goBack()} disabled={submitting}>
                    <Text style={loginStyles.buttonTextSecondary}>Back</Text>
                  </Pressable>
                  <Pressable style={[loginStyles.button, loginStyles.buttonPrimary]} onPress={handleSignup} disabled={submitting}>
                    {submitting ? <ActivityIndicator color={palette.white} /> : <Text style={loginStyles.buttonTextPrimary}>Sign Up</Text>}
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </LinearGradient>

      <Modal visible={verificationDialogVisible} transparent animationType="fade" onRequestClose={() => setVerificationDialogVisible(false)}>
        <View style={loginStyles.modalBackdrop}>
          <View style={loginStyles.modalCard}>
            <Text style={loginStyles.modalTitle}>Check your email</Text>
            <Text style={loginStyles.modalMessage}>
              We sent a verification link to {pendingEmail || "your email"}. Verify your email, then return to sign in.
            </Text>
            <Pressable style={[loginStyles.button, loginStyles.buttonPrimary, { marginTop: 16, marginHorizontal: 0 }]} onPress={() => { setVerificationDialogVisible(false); navigation.navigate("Login"); }}>
              <Text style={loginStyles.buttonTextPrimary}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
