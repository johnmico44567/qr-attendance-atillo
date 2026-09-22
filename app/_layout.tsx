import { Redirect, Stack, useSegments } from 'expo-router';

import { ActivityIndicator, View } from 'react-native';

import { COLORS } from '@/constants/colors';

import { useAuth } from '@/lib/auth';

export default function RootLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }

  const inAuthGroup =
    segments[0] === 'login' ||
    segments[0] === 'register';

  const inTabsGroup = segments[0] === '(tabs)';

  if (!user && inTabsGroup) {
    return <Redirect href="/login" />;
  }

  if (user && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};