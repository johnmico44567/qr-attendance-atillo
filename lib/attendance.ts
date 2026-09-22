import { supabase } from './supabase';

export type AttendanceRecord = {
  id: string;
  eventId: string;
  eventTitle: string;
  scannedAt: string;
};

type EventPayload = {
  v: number;
  event: string;
  title?: string;
  start?: string;
  end?: string;
};

export type RegisterResult = {
  success: boolean;
  message: string;
  eventTitle?: string;
};

export async function registerAttendance(rawPayload: string): Promise<RegisterResult> {
  let payload: EventPayload;

  try {
    payload = JSON.parse(rawPayload) as EventPayload;
  } catch {
    return { success: false, message: 'Invalid QR code.' };
  }

  if (payload.v !== 1 || !payload.event) {
    return { success: false, message: 'Not an attendance QR code.' };
  }

  const start = payload.start ? new Date(payload.start).getTime() : null;
  const end = payload.end ? new Date(payload.end).getTime() : null;

  if (
    (start !== null && Number.isNaN(start)) ||
    (end !== null && Number.isNaN(end))
  ) {
    return { success: false, message: 'Invalid event time.' };
  }

  const now = Date.now();
  if (start !== null && now < start) {
    return { success: false, message: 'Event has not started yet.' };
  }
  if (end !== null && now > end) {
    return { success: false, message: 'Event has already ended.' };
  }

  const { data, error } = await supabase.rpc('register_attendance', {
    p_event_code: payload.event,
    p_event_title: payload.title ?? payload.event,
    p_start: payload.start ?? null,
    p_end: payload.end ?? null,
  });

  if (error) {
    if (error.code === '23505') {
      return {
        success: false,
        message: 'Already registered for this event.',
        eventTitle: payload.title ?? payload.event,
      };
    }
    throw error;
  }

  return {
    success: true,
    message: 'Attendance recorded!',
    eventTitle: (data as { event_title?: string } | null)?.event_title ?? payload.title,
  };
}

export async function getAttendanceHistory(): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('id, event_id, scanned_at, events!inner(event_code, title)')
    .order('scanned_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const event = row.events as unknown as { event_code: string; title: string };
    return {
      id: row.id as string,
      eventId: event.event_code,
      eventTitle: event.title,
      scannedAt: row.scanned_at as string,
    };
  });
}

export type TeacherEventAttendance = {
  eventId: string;
  eventCode: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  attendeeCount: number;
  attendees: {
    studentId: string;
    scannedAt: string;
  }[];
};

export async function getTeacherEventAttendance(
  teacherId: string
): Promise<TeacherEventAttendance[]> {
  const { data: events, error: eventError } = await supabase
    .from('events')
    .select('id, event_code, title, start_time, end_time')
    .eq('created_by', teacherId)
    .order('created_at', { ascending: false });

  if (eventError || !events) return [];

  const eventIds = events.map((e: any) => e.id);

  if (eventIds.length === 0) return [];

  const { data: attendance, error: attError } = await supabase
    .from('attendance')
    .select('student_id, scanned_at, event_id')
    .in('event_id', eventIds)
    .order('scanned_at', { ascending: false });

  if (attError || !attendance) return [];

  return events.map((e: any) => {
    const rows = attendance.filter(
      (a: any) => a.event_id === e.id
    );

    return {
      eventId: e.id,
      eventCode: e.event_code,
      title: e.title,
      startTime: e.start_time,
      endTime: e.end_time,
      attendeeCount: rows.length,
      attendees: rows.map((a: any) => ({
        studentId: a.student_id,
        scannedAt: a.scanned_at,
      })),
    };
  });
}

export type TeacherEventSummary = {
  eventId: string;
  eventCode: string;
  title: string;
  attendeeCount: number;
};

export async function getTeacherEventSummary(
  teacherId: string
): Promise<TeacherEventSummary[]> {
  const events = await getTeacherEventAttendance(teacherId);

  return events.map((event) => ({
    eventId: event.eventId,
    eventCode: event.eventCode,
    title: event.title,
    attendeeCount: event.attendeeCount,
  }));
}
