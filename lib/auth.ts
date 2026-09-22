import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export type RegistrationDetails = {
  email: string;
  password: string;
  fullName: string;
  studentId: string;
  course?: string;
  yearLevel?: string;
};

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;
  return data;
}

export async function signUp(details: RegistrationDetails) {
  const { data, error } = await supabase.auth.signUp({
    email: details.email.trim(),
    password: details.password,
    options: {
      data: {
        full_name: details.fullName.trim(),
        student_id: details.studentId.trim(),
        course: details.course?.trim() || null,
        year_level: details.yearLevel?.trim() || null,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

export type AuthUser = User;
