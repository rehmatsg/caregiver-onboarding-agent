import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const caregivers = sqliteTable('caregivers', {
  // Primary key
  id: text('id').primaryKey(),
  
  // Basic information
  location: text('location'),
  profilePictureUrl: text('profile_picture_url'),
  status: text('status').default('in_progress').notNull(),
  
  // Arrays
  qualifications: text('qualifications').default('[]'), // string[]
  languages: text('languages').default('[]'), // string[]
  preferredAgeGroups: text('preferred_age_groups').default('[]'), // string[]
  dietaryPreferences: text('dietary_preferences').default('[]'), // string[]
  responsibilities: text('responsibilities').default('[]'), // string[]
  benefitsRequired: text('benefits_required').default('[]'), // string[]
  careTypes: text('care_types').default('[]'), // string[]
  
  // Availability
  startDate: text('start_date'),
  generalAvailability: text('general_availability'),
  weeklyHours: text('weekly_hours'),
  
  // Commute
  commuteDistance: text('commute_distance'),
  commuteType: text('commute_type'),
  willDriveChildren: text('will_drive_children'),
  
  accessibilityNeeds: text('accessibility_needs'),
  
  // Experience
  yearsOfExperience: text('years_of_experience').default('{}'), // object
  
  // Compensation
  hourlyRate: text('hourly_rate'),
  additionalChildRate: text('additional_child_rate'),
  payrollRequired: text('payroll_required'),
  
  // Time
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Caregiver = typeof caregivers.$inferSelect;
export type NewCaregiver = typeof caregivers.$inferInsert;

