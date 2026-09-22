import { router } from 'expo-router';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';

import { COLORS } from '@/constants/colors';

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="QR Attendance" />
      </View>

      <View style={styles.bodyContainer}>
        <Text style={styles.mainTitle}>
          School Event Attendance
        </Text>

        <Text style={styles.subtitle}>
          Scan QR Codes to record attendance during
          school activities.
        </Text>
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.buttonWrapper}>
          <AppButton
            theme="primary"
            title="Scan QR Code"
            icon="qr-code-outline"
            onPress={() => router.push('/scan')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <AppButton
            title="Attendance History"
            icon="time-outline"
            onPress={() => router.push('/history')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <AppButton
            title="Profile"
            icon="person-outline"
            onPress={() => router.push('/profile')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  headerContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: 'flex-start',
  },

  bodyContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: 'flex-start',
  },

  mainTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'left',
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.textSecondary,
    textAlign: 'left',
    maxWidth: 360,
  },

  footerContainer: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 12,
  },

  buttonWrapper: {
    width: '100%',
  },
});