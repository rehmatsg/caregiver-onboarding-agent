import { beforeEach, afterEach } from 'vitest';
import { db, schema } from '../index';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

/**
 * Test Setup File
 * 
 * This file runs before each test to ensure a clean database state.
 * It creates a test database and cleans it up after each test.
 */

beforeEach(async () => {
  // Create the caregivers table if it doesn't exist
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS caregivers (
      id TEXT PRIMARY KEY,
      location TEXT,
      profile_picture_url TEXT,
      status TEXT DEFAULT 'in_progress' NOT NULL,
      qualifications TEXT DEFAULT '[]',
      languages TEXT DEFAULT '[]',
      preferred_age_groups TEXT DEFAULT '[]',
      dietary_preferences TEXT DEFAULT '[]',
      responsibilities TEXT DEFAULT '[]',
      benefits_required TEXT DEFAULT '[]',
      care_types TEXT DEFAULT '[]',
      start_date TEXT,
      general_availability TEXT,
      weekly_hours TEXT,
      commute_distance TEXT,
      commute_type TEXT,
      will_drive_children TEXT,
      accessibility_needs TEXT,
      years_of_experience TEXT DEFAULT '{}',
      hourly_rate TEXT,
      additional_child_rate TEXT,
      payroll_required TEXT,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);
});

afterEach(async () => {
  // Clean up the caregivers table after each test
  await db.delete(schema.caregivers);
});

