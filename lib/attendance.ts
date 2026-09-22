import { supabase } from './supabase';
import { parseQRPayload } from './qr';
import { getEventByCode } from './events';

export type AttendanceRecord = {
  id: string;
  eventId: string;
  eventTitle: string;
  scannedAt: string;
};

export type TeacherAttendanceRecord = {
  id: string;
  eventId: string;
  eventTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  scannedAt: string;
};

export type TeacherEventSummary = {
  eventId: string;
  eventCode: string;
  title: string;
  attendeeCount: number;
};

export type RegisterResult = {
  success: boolean;
  message: string;
  eventTitle?: string;
};

/**
 * Registers a student's attendance from a QR payload.
 */
export async function registerAttendance(
  rawPayload: string,
  studentId: string
): Promise<RegisterResult> {
  const payload = parseQRPayload(rawPayload);

  if (!payload) {
    return {
      success: false,
      message: 'Invalid QR code.',
    };
  }

  const now = Date.now();

  const start = payload.start
    ? new Date(payload.start).getTime()
    : null;

  const end = payload.end
    ? new Date(payload.end).getTime()
    : null;

  if (start !== null && now < start) {
    return {
      success: false,
      message: 'Event has not started yet.',
    };
  }

  if (end !== null && now > end) {
    return {
      success: false,
      message: 'Event has already ended.',
    };
  }

  const title = payload.title ?? payload.event;

  let event: {
    id: string;
    title: string;
  } | null = null;

  const foundEvent = await getEventByCode(payload.event);

  if (foundEvent) {
    event = foundEvent;
  } else {
    const {
      data: newEvent,
      error: insertError,
    } = await supabase
      .from('events')
      .insert([
        {
          event_code: payload.event,
          title,
          start_time: payload.start ?? null,
          end_time: payload.end ?? null,
        },
      ])
      .select('id, title')
      .single();

    if (insertError || !newEvent) {
      return {
        success: false,
        message: 'Could not create event.',
      };
    }

    event = newEvent;
  }

  const { error: attError } = await supabase
    .from('attendance')
    .insert([
      {
        student_id: studentId,
        event_id: event.id,
      },
    ]);

  if (attError) {
    if (attError.code === '23505') {
      return {
        success: false,
        message: 'Already registered for this event.',
        eventTitle: event.title,
      };
    }

    return {
      success: false,
      message: attError.message,
      eventTitle: event.title,
    };
  }

  return {
    success: true,
    message: 'Attendance recorded!',
    eventTitle: event.title,
  };
}

/**
 * Gets attendance records for a student.
 */
export async function getAttendanceHistory(
  studentId: string
): Promise<AttendanceRecord[]> {
  const {
    data,
    error,
  } = await supabase
    .from('attendance')
    .select('id, scanned_at, events ( event_code, title )')
    .eq('student_id', studentId)
    .order('scanned_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    eventId: row.events?.event_code ?? '',
    eventTitle: row.events?.title ?? '',
    scannedAt: row.scanned_at,
  }));
}

/**
 * Gets attendance records for events created by a teacher.
 *
 * Includes the attendee's profile name and email.
 */
export async function getTeacherAttendanceHistory(
  teacherId: string
): Promise<TeacherAttendanceRecord[]> {
  const {
    data,
    error,
  } = await supabase
    .from('attendance')
    .select(`
      id,
      student_id,
      scanned_at,
      profiles (
        full_name,
        email
      ),
      events!inner (
        id,
        event_code,
        title,
        created_by
      )
    `)
    .eq('events.created_by', teacherId)
    .order('scanned_at', { ascending: false });

  if (error || !data) {
    console.log(
      'Teacher attendance history error:',
      error
    );

    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    eventId: row.events?.event_code ?? '',
    eventTitle: row.events?.title ?? '',
    studentId: row.student_id,
    studentName: row.profiles?.full_name ?? '',
    studentEmail: row.profiles?.email ?? '',
    scannedAt: row.scanned_at,
  }));
}

/**
 * Gets a lightweight summary of events created by a teacher.
 *
 * Only event_id is fetched from attendance because the UI
 * only needs the number of attendees per event.
 */
export async function getTeacherEventSummary(
  teacherId: string
): Promise<TeacherEventSummary[]> {
  const {
    data: events,
    error: eventsError,
  } = await supabase
    .from('events')
    .select('id, event_code, title')
    .eq('created_by', teacherId)
    .order('created_at', { ascending: false });

  if (eventsError || !events) {
    console.log(
      'Teacher event summary error:',
      eventsError
    );

    return [];
  }

  const eventIds = events.map((event) => event.id);

  if (eventIds.length === 0) {
    return [];
  }

  const {
    data: attRows,
    error: attError,
  } = await supabase
    .from('attendance')
    .select('event_id')
    .in('event_id', eventIds);

  if (attError || !attRows) {
    console.log(
      'Teacher event count error:',
      attError
    );

    return [];
  }

  const counts: Record<string, number> = {};

  attRows.forEach((row) => {
    counts[row.event_id] =
      (counts[row.event_id] ?? 0) + 1;
  });

  return events.map((event) => ({
    eventId: event.id,
    eventCode: event.event_code,
    title: event.title,
    attendeeCount: counts[event.id] ?? 0,
  }));
}