import { Link, router } from 'expo-router';

import { useState } from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';

import { COLORS } from '@/constants/colors';

import { signIn } from '@/lib/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setMessage('Email and password are required.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const { data, error } = await signIn(
        email.trim(),
        password
      );

      if (error) {
        setMessage(error.message);
      } else if (data.session) {
        router.replace('/(tabs)');
      } else {
        setMessage(
          'Login succeeded, but no session was returned.'
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to sign in.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Header title="QR Attendance" />
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to record your attendance
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!submitting}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!submitting}
            />

            {message && (
              <Text style={styles.message}>
                {message}
              </Text>
            )}

            <AppButton
              theme="primary"
              title={
                submitting ? 'Signing in...' : 'Sign In'
              }
              icon="log-in-outline"
              onPress={() => void handleLogin()}
            />

            {submitting && (
              <ActivityIndicator
                style={styles.loading}
                color={COLORS.primary}
              />
            )}

            <Link
              href="/register"
              style={styles.link}
            >
              Don&apos;t have an account? Sign Up
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },

  form: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },

  input: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    color: COLORS.textPrimary,
    fontSize: 16,
  },

  message: {
    color: COLORS.danger,
    marginBottom: 12,
    textAlign: 'left',
  },

  loading: {
    marginTop: 12,
  },

  link: {
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
});