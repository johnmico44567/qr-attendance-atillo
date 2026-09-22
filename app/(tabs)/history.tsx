import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS } from '@/constants/colors';

import {
  getAttendanceHistory,
  getTeacherAttendanceHistory,
  getTeacherEventSummary,
  type AttendanceRecord,
  type TeacherAttendanceRecord,
  type TeacherEventSummary,
} from '@/lib/attendance';

import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function HistoryScreen() {
  const [studentRecords, setStudentRecords] = useState<
    AttendanceRecord[]
  >([]);

  const [teacherRecords, setTeacherRecords] = useState<
    TeacherAttendanceRecord[]
  >([]);

  const [teacherSummaries, setTeacherSummaries] = useState<
    TeacherEventSummary[]
  >([]);

  const [role, setRole] = useState<
    'student' | 'teacher' | null
  >(null);

  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const loadHistory = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.log('Profile error:', profileError);
        setLoading(false);
        return;
      }

      if (profile?.role === 'teacher') {
        setRole('teacher');

        const summaries =
          await getTeacherEventSummary(user.id);

        const attendanceRows =
          await getTeacherAttendanceHistory(user.id);

        setTeacherSummaries(summaries);
        setTeacherRecords(attendanceRows);
        setStudentRecords([]);
      } else {
        setRole('student');

        const rows =
          await getAttendanceHistory(user.id);

        setStudentRecords(rows);
        setTeacherRecords([]);
        setTeacherSummaries([]);
      }
    } catch (error) {
      console.log('History loading error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Attendance History
      </Text>

      {loading ? (
        <Text style={styles.subtitle}>
          Loading records...
        </Text>
      ) : role === 'teacher' ? (
        teacherSummaries.length === 0 ? (
          <Text style={styles.subtitle}>
            No events or student attendance records yet.
          </Text>
        ) : (
          <FlatList
            data={teacherSummaries}
            keyExtractor={(item) => item.eventId}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const attendees =
                teacherRecords.filter(
                  (record) =>
                    record.eventId === item.eventCode
                );

              return (
                <View style={styles.card}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTitleContainer}>
                      <Text style={styles.eventTitle}>
                        {item.title}
                      </Text>

                      <Text style={styles.eventMeta}>
                        Event Code: {item.eventCode}
                      </Text>
                    </View>

                    <View style={styles.countBadge}>
                      <Text style={styles.countNumber}>
                        {item.attendeeCount}
                      </Text>

                      <Text style={styles.countLabel}>
                        {item.attendeeCount === 1
                          ? 'attendee'
                          : 'attendees'}
                      </Text>
                    </View>
                  </View>

                  {attendees.length > 0 && (
                    <View style={styles.attendeeSection}>
                      <Text style={styles.attendeeHeading}>
                        Attendance
                      </Text>

                      {attendees.map((attendee) => (
                        <View
                          key={attendee.id}
                          style={styles.attendeeRow}
                        >
                          <View style={styles.attendeeInfo}>
                            <Text style={styles.studentId}>
                              Student
                            </Text>

                            <Text style={styles.studentValue}>
                              {attendee.studentName ||
                                attendee.studentId}
                            </Text>

                            {attendee.studentEmail ? (
                              <Text style={styles.studentEmail}>
                                {attendee.studentEmail}
                              </Text>
                            ) : null}
                          </View>

                          <Text style={styles.attendedDate}>
                            {formatDate(attendee.scannedAt)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            }}
          />
        )
      ) : (
        studentRecords.length === 0 ? (
          <Text style={styles.subtitle}>
            No records yet. Scan a QR code to register your
            attendance.
          </Text>
        ) : (
          <FlatList
            data={studentRecords}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.eventTitle}>
                  {item.eventTitle}
                </Text>

                <Text style={styles.eventMeta}>
                  {item.eventId}
                </Text>

                <Text style={styles.eventMeta}>
                  {formatDate(item.scannedAt)}
                </Text>
              </View>
            )}
          />
        )
      )}
    </View>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 32,
  },

  list: {
    paddingBottom: 24,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },

  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },

  eventTitleContainer: {
    flex: 1,
  },

  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },

  eventMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 70,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },

  countNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  countLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },

  attendeeSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  attendeeHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  attendeeRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  attendeeInfo: {
    marginBottom: 4,
  },

  studentId: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },

  studentValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },

  studentEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  attendedDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});