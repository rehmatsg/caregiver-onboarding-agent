/**
 * TypeScript Types for Caregiver Profile
 * 
 * These types represent the caregiver data in its fully parsed form
 * (arrays and objects are deserialized from JSON).
 */

export interface YearsOfExperience {
  [ageGroup: string]: number | string;
}

export interface CaregiverProfile {
  id: string;
  location: string | null;
  profilePictureUrl: string | null;
  status: string;
  qualifications: string[];
  languages: string[];
  preferredAgeGroups: string[];
  dietaryPreferences: string[];
  responsibilities: string[];
  benefitsRequired: string[];
  careTypes: string[];
  startDate: string | null;
  generalAvailability: string | null;
  weeklyHours: string | null;
  commuteDistance: string | null;
  commuteType: string | null;
  willDriveChildren: string | null;
  accessibilityNeeds: string | null;
  yearsOfExperience: YearsOfExperience;
  hourlyRate: string | null;
  additionalChildRate: string | null;
  payrollRequired: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartialCaregiverUpdate {
  id?: string;
  location?: string | null;
  profilePictureUrl?: string | null;
  status?: string;
  qualifications?: string[];
  languages?: string[];
  preferredAgeGroups?: string[];
  dietaryPreferences?: string[];
  responsibilities?: string[];
  benefitsRequired?: string[];
  careTypes?: string[];
  startDate?: string | null;
  generalAvailability?: string | null;
  weeklyHours?: string | null;
  commuteDistance?: string | null;
  commuteType?: string | null;
  willDriveChildren?: string | null;
  accessibilityNeeds?: string | null;
  yearsOfExperience?: YearsOfExperience;
  hourlyRate?: string | null;
  additionalChildRate?: string | null;
  payrollRequired?: string | null;
}

