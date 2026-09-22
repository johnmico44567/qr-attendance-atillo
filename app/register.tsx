import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { signUp } from '@/lib/auth';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !studentId.trim() || !email.trim() || !password) {
      setMessage('Name, student ID, email, and password are required.');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await signUp({ fullName, studentId, email, password });
      if (!result.session) {
        setMessage('Account created. Check your email to confirm your account.');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to register.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>New accounts start with student access.</Text>
      <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={COLORS.textSecondary} value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Student ID" placeholderTextColor={COLORS.textSecondary} value={studentId} onChangeText={setStudentId} autoCapitalize="characters" />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor={COLORS.textSecondary} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor={COLORS.textSecondary} value={password} onChangeText={setPassword} secureTextEntry />
      {message && <Text style={styles.message}>{message}</Text>}
      <AppButton theme="primary" title={submitting ? 'Creating account...' : 'Register'} icon="person-add-outline" onPress={() => void handleRegister()} />
      <Link href="/login" style={styles.link}>Already have an account? Sign in</Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  subtitle: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  input: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 12, color: COLORS.textPrimary },
  message: { color: COLORS.textPrimary, textAlign: 'center', marginBottom: 12 },
  link: { color: COLORS.primary, textAlign: 'center', marginTop: 8, fontSize: 16 },
});
