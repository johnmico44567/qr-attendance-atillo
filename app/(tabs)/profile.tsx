import { router, useFocusEffect } from 'expo-router';

import { useCallback, useState } from 'react';

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import AppButton from '@/components/AppButton';

import Header from '@/components/Header';

import { COLORS } from '@/constants/colors';

import { signOut, useAuth } from '@/lib/auth';

import {
  getProfile,
  updateProfile,
  type Profile,
} from '@/lib/profiles';

export default function ProfileScreen() {
  const { user } = useAuth();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [draftName, setDraftName] = useState('');

  const [editing, setEditing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<string | null>(
    null
  );

  const loadProfile = useCallback(async () => {
    if (!user) return;

    const p = await getProfile(user.id);

    setProfile(p);

    setDraftName(p?.full_name ?? '');
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile])
  );

  const handleSaveName = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    const { error } = await updateProfile(user.id, {
      full_name: draftName.trim(),
    });

    setSaving(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            full_name: draftName.trim(),
          }
        : prev
    );

    setEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();

      router.replace('/login');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to sign out.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header title="QR Attendance" />

      <View style={styles.content}>
        <Text style={styles.title}>
          My Profile
        </Text>

        {profile?.role === 'teacher' ? (
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              Teacher
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.roleBadge,
              styles.roleBadgeStudent,
            ]}
          >
            <Text style={styles.roleBadgeText}>
              Student
            </Text>
          </View>
        )}

        <Text style={styles.label}>
          Name
        </Text>

        {editing ? (
          <View style={styles.nameEditRow}>
            <TextInput
              style={styles.nameInput}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Enter your name"
              placeholderTextColor={
                COLORS.textSecondary
              }
              autoCapitalize="words"
              editable={!saving}
            />

            <Pressable
              style={styles.saveButton}
              onPress={() => void handleSaveName()}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setEditing(true)}
            style={styles.nameRow}
          >
            <Text style={styles.value}>
              {profile?.full_name ||
                'Tap to add your name'}
            </Text>

            <Text style={styles.editHint}>
              Edit
            </Text>
          </Pressable>
        )}

        <Text style={styles.label}>
          Email
        </Text>

        <Text style={styles.value}>
          {profile?.email ??
            user?.email ??
            'No email'}
        </Text>

        <Text style={styles.label}>
          User ID
        </Text>

        <Text style={styles.value}>
          {user?.id ?? 'No user ID'}
        </Text>

        {message && (
          <Text style={styles.message}>
            {message}
          </Text>
        )}

        <AppButton
          title="Sign Out"
          icon="log-out-outline"
          onPress={() => void handleSignOut()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },

  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 16,
  },

  roleBadgeStudent: {
    backgroundColor: '#5D6B7A',
  },

  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },

  value: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  editHint: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 12,
  },

  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  nameInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  message: {
    fontSize: 14,
    color: COLORS.danger,
    marginTop: 16,
    marginBottom: 12,
  },
});