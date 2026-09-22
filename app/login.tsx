import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import AppButton from '@/components/AppButton';
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
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR-ATT</Text>
      <Text style={styles.subtitle}>Sign in to manage your attendance.</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={COLORS.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {message && <Text style={styles.message}>{message}</Text>}
      <AppButton
        theme="primary"
        title={submitting ? 'Signing in...' : 'Sign In'}
        icon="log-in-outline"
        onPress={() => void handleLogin()}
      />
      <Link href="/register" style={styles.link}>
        Create an account
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  subtitle: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  input: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 12, color: COLORS.textPrimary },
  message: { color: '#C62828', textAlign: 'center', marginBottom: 12 },
  link: { color: COLORS.primary, textAlign: 'center', marginTop: 8, fontSize: 16 },
});
