/**
 * Minor Profile Management
 * Functions for creating and managing minor profiles
 */

import { neon } from '@neondatabase/serverless';
import type { MinorProfile, CreateMinorProfileInput } from './types';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Create a new minor profile
 */
export async function createMinorProfile(
  userId: string,
  input: CreateMinorProfileInput
): Promise<MinorProfile> {
  const result = await sql`
    INSERT INTO minor_profiles (
      full_name,
      date_of_birth,
      gender,
      school_name,
      class_grade,
      national_id,
      student_number,
      created_by_user_id
    )
    VALUES (
      ${input.full_name},
      ${input.date_of_birth},
      ${input.gender || null},
      ${input.school_name || null},
      ${input.class_grade || null},
      ${input.national_id || null},
      ${input.student_number || null},
      ${userId}
    )
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error('Failed to create minor profile');
  }

  return result[0] as MinorProfile;
}

/**
 * Get minor profile by ID
 */
export async function getMinorProfileById(id: string): Promise<MinorProfile | null> {
  const result = await sql`
    SELECT * FROM minor_profiles
    WHERE id = ${id}
  `;

  return result.length > 0 ? (result[0] as MinorProfile) : null;
}

/**
 * Get all minor profiles created by a user
 */
export async function getMinorProfilesByUser(userId: string): Promise<MinorProfile[]> {
  const result = await sql`
    SELECT * FROM minor_profiles
    WHERE created_by_user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return result as MinorProfile[];
}

/**
 * Update minor profile
 */
export async function updateMinorProfile(
  id: string,
  userId: string,
  updates: Partial<CreateMinorProfileInput>
): Promise<MinorProfile> {
  const sql = neon(process.env.DATABASE_URL!);
  // Verify ownership
  const existing = await getMinorProfileById(id);
  if (!existing || existing.created_by_user_id !== userId) {
    throw new Error('Minor profile not found or access denied');
  }

  const result = await sql`
    UPDATE minor_profiles
    SET
      full_name = COALESCE(${updates.full_name || null}, full_name),
      date_of_birth = COALESCE(${updates.date_of_birth || null}, date_of_birth),
      gender = COALESCE(${updates.gender || null}, gender),
      school_name = COALESCE(${updates.school_name || null}, school_name),
      class_grade = COALESCE(${updates.class_grade || null}, class_grade),
      national_id = COALESCE(${updates.national_id || null}, national_id),
      student_number = COALESCE(${updates.student_number || null}, student_number),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error('Failed to update minor profile');
  }

  return result[0] as MinorProfile;
}

/**
 * Delete minor profile
 */
export async function deleteMinorProfile(id: string, userId: string): Promise<boolean> {
  const sql = neon(process.env.DATABASE_URL!);
  // Verify ownership
  const existing = await getMinorProfileById(id);
  if (!existing || existing.created_by_user_id !== userId) {
    throw new Error('Minor profile not found or access denied');
  }

  const result = await sql`
    DELETE FROM minor_profiles
    WHERE id = ${id} AND created_by_user_id = ${userId}
    RETURNING id
  `;

  return result.length > 0;
}

/**
 * Check if user owns a minor profile
 */
export async function userOwnsMinor(userId: string, minorId: string): Promise<boolean> {
  const sql = neon(process.env.DATABASE_URL!);
  const result = await sql`
    SELECT id FROM minor_profiles
    WHERE id = ${minorId} AND created_by_user_id = ${userId}
  `;

  return result.length > 0;
}

/**
 * Get minor profile with enrollment count
 */
export async function getMinorWithEnrollmentCount(minorId: string): Promise<{
  minor: MinorProfile;
  enrollment_count: number;
}> {
  const sql = neon(process.env.DATABASE_URL!);
  const minor = await getMinorProfileById(minorId);
  if (!minor) {
    throw new Error('Minor profile not found');
  }

  const countResult = await sql`
    SELECT COUNT(*) as count
    FROM olympiad_participants
    WHERE minor_profile_id = ${minorId}
  `;

  return {
    minor,
    enrollment_count: parseInt(countResult[0].count as string),
  };
}
