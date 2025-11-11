import { eq, sql } from 'drizzle-orm';
import { db, schema } from './index';
import { CaregiverProfile, PartialCaregiverUpdate, YearsOfExperience } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Helper function to parse JSON fields from database
 */
function parseCaregiver(dbRow: any): CaregiverProfile {
  return {
    id: dbRow.id,
    location: dbRow.location,
    profilePictureUrl: dbRow.profilePictureUrl,
    status: dbRow.status,
    qualifications: JSON.parse(dbRow.qualifications || '[]'),
    languages: JSON.parse(dbRow.languages || '[]'),
    preferredAgeGroups: JSON.parse(dbRow.preferredAgeGroups || '[]'),
    dietaryPreferences: JSON.parse(dbRow.dietaryPreferences || '[]'),
    responsibilities: JSON.parse(dbRow.responsibilities || '[]'),
    benefitsRequired: JSON.parse(dbRow.benefitsRequired || '[]'),
    careTypes: JSON.parse(dbRow.careTypes || '[]'),
    startDate: dbRow.startDate,
    generalAvailability: dbRow.generalAvailability,
    weeklyHours: dbRow.weeklyHours,
    commuteDistance: dbRow.commuteDistance,
    commuteType: dbRow.commuteType,
    willDriveChildren: dbRow.willDriveChildren,
    accessibilityNeeds: dbRow.accessibilityNeeds,
    yearsOfExperience: JSON.parse(dbRow.yearsOfExperience || '{}'),
    hourlyRate: dbRow.hourlyRate,
    additionalChildRate: dbRow.additionalChildRate,
    payrollRequired: dbRow.payrollRequired,
    createdAt: new Date(dbRow.createdAt),
    updatedAt: new Date(dbRow.updatedAt),
  };
}

/**
 * Helper function to merge arrays
 */
function mergeArrays(existing: string[], incoming: string[]): string[] {
  return Array.from(new Set([...existing, ...incoming]));
}

/**
 * Helper function to merge objects
 */
function mergeObjects(existing: YearsOfExperience, incoming: YearsOfExperience): YearsOfExperience {
  return { ...existing, ...incoming };
}

/**
 * Create a new caregiver record
 * 
 * @param id Optional custom ID, otherwise generates a UUID
 * @returns The newly created caregiver profile
 */
export async function createCaregiver(id?: string): Promise<CaregiverProfile> {
  const caregiverId = id || uuidv4();
  
  const [result] = await db
    .insert(schema.caregivers)
    .values({
      id: caregiverId,
      status: 'in_progress',
    })
    .returning();
  
  return parseCaregiver(result);
}

/**
 * Fetch a caregiver record by id
 * 
 * @param id The caregiver ID to fetch
 * @returns The caregiver profile or null if not found
 */
export async function getCaregiverById(id: string): Promise<CaregiverProfile | null> {
  const result = await db
    .select()
    .from(schema.caregivers)
    .where(eq(schema.caregivers.id, id))
    .limit(1);
  
  if (result.length === 0) {
    return null;
  }
  
  return parseCaregiver(result[0]);
}

/**
 * Update any field of a caregiver record
 * 
 * @param id The caregiver ID to update
 * @param updates The partial updates to apply
 * @returns The updated caregiver profile or null if not found
 */
export async function updateCaregiver(
  id: string,
  updates: PartialCaregiverUpdate
): Promise<CaregiverProfile | null> {
  // Fetch the existing record
  const existing = await getCaregiverById(id);
  
  if (!existing) {
    return null;
  }
  
  // Prepare the update object
  const dbUpdates: any = {};
  
  // Handle simple fields
  const simpleFields = [
    'location',
    'profilePictureUrl',
    'status',
    'startDate',
    'generalAvailability',
    'weeklyHours',
    'commuteDistance',
    'commuteType',
    'willDriveChildren',
    'accessibilityNeeds',
    'hourlyRate',
    'additionalChildRate',
    'payrollRequired',
  ] as const;
  
  for (const field of simpleFields) {
    if (field in updates) {
      dbUpdates[field] = updates[field];
    }
  }
  
  // Handle array fields
  const arrayFields: (keyof PartialCaregiverUpdate)[] = [
    'qualifications',
    'languages',
    'preferredAgeGroups',
    'dietaryPreferences',
    'responsibilities',
    'benefitsRequired',
    'careTypes',
  ];
  
  for (const field of arrayFields) {
    if (field in updates && updates[field]) {
      const existingArray = existing[field] as string[];
      const incomingArray = updates[field] as string[];
      const mergedArray = mergeArrays(existingArray, incomingArray);
      dbUpdates[field] = JSON.stringify(mergedArray);
    }
  }
  
  // Handle yearsOfExperience object
  if (updates.yearsOfExperience) {
    const mergedExperience = mergeObjects(
      existing.yearsOfExperience,
      updates.yearsOfExperience
    );
    dbUpdates.yearsOfExperience = JSON.stringify(mergedExperience);
  }
  
  // Update the updatedAt field
  dbUpdates.updatedAt = sql`(unixepoch())`;
  
  // Update the caregiver record
  const [result] = await db
    .update(schema.caregivers)
    .set(dbUpdates)
    .where(eq(schema.caregivers.id, id))
    .returning();
  
  return parseCaregiver(result);
}

/**
 * Delete a caregiver record
 * 
 * @param id The caregiver ID to delete
 * @returns True if deleted, false if not found
 */
export async function deleteCaregiver(id: string): Promise<boolean> {
  const result = await db
    .delete(schema.caregivers)
    .where(eq(schema.caregivers.id, id))
    .returning();
  
  return result.length > 0;
}

/**
 * List all caregivers
 * 
 * @returns Array of all caregiver profiles
 */
export async function listAllCaregivers(): Promise<CaregiverProfile[]> {
  const results = await db.select().from(schema.caregivers);
  return results.map(parseCaregiver);
}

