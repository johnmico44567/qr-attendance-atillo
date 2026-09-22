import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { signOut } from '@/lib/auth';
import { useAuth } from '@/lib/auth-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { profile } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.subtitle}>{profile?.full_name}</Text>
      <Text style={styles.detail}>{profile?.email}</Text>
      <Text style={styles.detail}>{profile?.role}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      <AppButton title="Sign Out" icon="log-out-outline" onPress={() => void handleSignOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  title: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  detail: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },
  message: { fontSize: 14, color: '#C62828', marginTop: 12, marginBottom: 8 },
});