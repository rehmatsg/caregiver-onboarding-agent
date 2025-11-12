import { describe, it, expect, beforeEach } from 'vitest';
import {
  createCaregiver,
  getCaregiverById,
  updateCaregiver,
  deleteCaregiver,
  listAllCaregivers,
} from '../caregivers';
import { CaregiverProfile } from '../types';

describe('Caregiver Database Operations', () => {
  describe('createCaregiver', () => {
    it('should create a new caregiver with default values', async () => {
      const caregiver = await createCaregiver();

      expect(caregiver).toBeDefined();
      expect(caregiver.id).toBeDefined();
      expect(typeof caregiver.id).toBe('string');
      expect(caregiver.status).toBe('in_progress');
      expect(caregiver.qualifications).toEqual([]);
      expect(caregiver.languages).toEqual([]);
      expect(caregiver.preferredAgeGroups).toEqual([]);
      expect(caregiver.dietaryPreferences).toEqual([]);
      expect(caregiver.responsibilities).toEqual([]);
      expect(caregiver.benefitsRequired).toEqual([]);
      expect(caregiver.careTypes).toEqual([]);
      expect(caregiver.yearsOfExperience).toEqual({});
      expect(caregiver.createdAt).toBeInstanceOf(Date);
      expect(caregiver.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a caregiver with a custom ID', async () => {
      const customId = 'custom-test-id-123';
      const caregiver = await createCaregiver(customId);

      expect(caregiver.id).toBe(customId);
      expect(caregiver.status).toBe('in_progress');
    });

    it('should create multiple caregivers with unique IDs', async () => {
      const caregiver1 = await createCaregiver();
      const caregiver2 = await createCaregiver();

      expect(caregiver1.id).not.toBe(caregiver2.id);
    });
  });

  describe('getCaregiverById', () => {
    it('should retrieve an existing caregiver by ID', async () => {
      const created = await createCaregiver();
      const retrieved = await getCaregiverById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.status).toBe('in_progress');
    });

    it('should return null for non-existent caregiver', async () => {
      const result = await getCaregiverById('non-existent-id');
      expect(result).toBeNull();
    });

    it('should correctly parse JSON fields', async () => {
      const created = await createCaregiver();
      const retrieved = await getCaregiverById(created.id);

      expect(Array.isArray(retrieved?.qualifications)).toBe(true);
      expect(Array.isArray(retrieved?.languages)).toBe(true);
      expect(typeof retrieved?.yearsOfExperience).toBe('object');
    });
  });

  describe('updateCaregiver - Simple Fields', () => {
    it('should update string fields', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        location: 'New York, NY',
        hourlyRate: '$25',
        weeklyHours: '40',
      });

      expect(updated).toBeDefined();
      expect(updated?.location).toBe('New York, NY');
      expect(updated?.hourlyRate).toBe('$25');
      expect(updated?.weeklyHours).toBe('40');
    });

    it('should update status field', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        status: 'complete',
      });

      expect(updated?.status).toBe('complete');
    });

    it('should update profilePictureUrl', async () => {
      const caregiver = await createCaregiver();
      const pictureUrl = 'https://example.com/profile.jpg';
      
      const updated = await updateCaregiver(caregiver.id, {
        profilePictureUrl: pictureUrl,
      });

      expect(updated?.profilePictureUrl).toBe(pictureUrl);
    });

    it('should update commute preferences', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        commuteDistance: '10 miles',
        commuteType: 'public transit',
        willDriveChildren: 'yes',
      });

      expect(updated?.commuteDistance).toBe('10 miles');
      expect(updated?.commuteType).toBe('public transit');
      expect(updated?.willDriveChildren).toBe('yes');
    });

    it('should update accessibility needs', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        accessibilityNeeds: 'wheelchair accessible',
      });

      expect(updated?.accessibilityNeeds).toBe('wheelchair accessible');
    });

    it('should update compensation fields', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        hourlyRate: '$30',
        additionalChildRate: '$5',
        payrollRequired: 'yes',
      });

      expect(updated?.hourlyRate).toBe('$30');
      expect(updated?.additionalChildRate).toBe('$5');
      expect(updated?.payrollRequired).toBe('yes');
    });

    it('should update timestamp on every update', async () => {
      const caregiver = await createCaregiver();
      const originalUpdatedAt = caregiver.updatedAt;
      
      // Wait a moment to ensure timestamp difference (unixepoch() is in seconds)
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const updated = await updateCaregiver(caregiver.id, {
        location: 'Boston, MA',
      });

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should return null when updating non-existent caregiver', async () => {
      const result = await updateCaregiver('non-existent-id', {
        location: 'Somewhere',
      });

      expect(result).toBeNull();
    });
  });

  describe('updateCaregiver - Array Fields', () => {
    it('should add items to qualifications array', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        qualifications: ['CPR Certified', 'First Aid'],
      });

      expect(updated?.qualifications).toEqual(['CPR Certified', 'First Aid']);
    });

    it('should merge arrays without duplicates', async () => {
      const caregiver = await createCaregiver();
      
      // First update
      await updateCaregiver(caregiver.id, {
        languages: ['English', 'Spanish'],
      });
      
      // Second update with one duplicate
      const updated = await updateCaregiver(caregiver.id, {
        languages: ['Spanish', 'French'],
      });

      expect(updated?.languages).toHaveLength(3);
      expect(updated?.languages).toContain('English');
      expect(updated?.languages).toContain('Spanish');
      expect(updated?.languages).toContain('French');
    });

    it('should update preferredAgeGroups array', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        preferredAgeGroups: ['infant', 'toddler'],
      });

      expect(updated?.preferredAgeGroups).toEqual(['infant', 'toddler']);
    });

    it('should update dietaryPreferences array', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        dietaryPreferences: ['vegetarian', 'gluten-free'],
      });

      expect(updated?.dietaryPreferences).toEqual(['vegetarian', 'gluten-free']);
    });

    it('should update responsibilities array', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        responsibilities: ['meal prep', 'homework help', 'transportation'],
      });

      expect(updated?.responsibilities).toEqual(['meal prep', 'homework help', 'transportation']);
    });

    it('should update benefitsRequired array', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        benefitsRequired: ['health insurance', 'paid time off'],
      });

      expect(updated?.benefitsRequired).toEqual(['health insurance', 'paid time off']);
    });

    it('should update careTypes array', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        careTypes: ['full-time', 'live-in'],
      });

      expect(updated?.careTypes).toEqual(['full-time', 'live-in']);
    });

    it('should handle multiple array updates at once', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        qualifications: ['CPR'],
        languages: ['English'],
        careTypes: ['part-time'],
      });

      expect(updated?.qualifications).toEqual(['CPR']);
      expect(updated?.languages).toEqual(['English']);
      expect(updated?.careTypes).toEqual(['part-time']);
    });

    it('should preserve existing arrays when updating different arrays', async () => {
      const caregiver = await createCaregiver();
      
      await updateCaregiver(caregiver.id, {
        qualifications: ['CPR'],
      });
      
      const updated = await updateCaregiver(caregiver.id, {
        languages: ['English'],
      });

      expect(updated?.qualifications).toEqual(['CPR']);
      expect(updated?.languages).toEqual(['English']);
    });

    it('should merge arrays across multiple updates', async () => {
      const caregiver = await createCaregiver();
      
      await updateCaregiver(caregiver.id, {
        qualifications: ['CPR', 'First Aid'],
      });
      
      await updateCaregiver(caregiver.id, {
        qualifications: ['First Aid', 'Montessori Training'],
      });
      
      const final = await getCaregiverById(caregiver.id);

      expect(final?.qualifications).toHaveLength(3);
      expect(final?.qualifications).toContain('CPR');
      expect(final?.qualifications).toContain('First Aid');
      expect(final?.qualifications).toContain('Montessori Training');
    });
  });

  describe('updateCaregiver - Object Fields', () => {
    it('should set yearsOfExperience object', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        yearsOfExperience: {
          infant: 2,
          toddler: 3,
        },
      });

      expect(updated?.yearsOfExperience).toEqual({
        infant: 2,
        toddler: 3,
      });
    });

    it('should merge yearsOfExperience object keys', async () => {
      const caregiver = await createCaregiver();
      
      await updateCaregiver(caregiver.id, {
        yearsOfExperience: {
          infant: 2,
          toddler: 3,
        },
      });
      
      const updated = await updateCaregiver(caregiver.id, {
        yearsOfExperience: {
          toddler: 5,
          preschool: 4,
        },
      });

      expect(updated?.yearsOfExperience).toEqual({
        infant: 2,
        toddler: 5,
        preschool: 4,
      });
    });

    it('should handle string values in yearsOfExperience', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        yearsOfExperience: {
          infant: '2 years',
          toddler: '3 years',
        },
      });

      expect(updated?.yearsOfExperience.infant).toBe('2 years');
      expect(updated?.yearsOfExperience.toddler).toBe('3 years');
    });
  });

  describe('updateCaregiver - Complex Scenarios', () => {
    it('should handle partial updates without affecting other fields', async () => {
      const caregiver = await createCaregiver();
      
      await updateCaregiver(caregiver.id, {
        location: 'New York, NY',
        qualifications: ['CPR'],
        hourlyRate: '$25',
      });
      
      const updated = await updateCaregiver(caregiver.id, {
        weeklyHours: '40',
      });

      expect(updated?.location).toBe('New York, NY');
      expect(updated?.qualifications).toEqual(['CPR']);
      expect(updated?.hourlyRate).toBe('$25');
      expect(updated?.weeklyHours).toBe('40');
    });

    it('should handle mixed updates of strings, arrays, and objects', async () => {
      const caregiver = await createCaregiver();
      
      const updated = await updateCaregiver(caregiver.id, {
        location: 'Los Angeles, CA',
        status: 'complete',
        qualifications: ['CPR', 'First Aid'],
        languages: ['English', 'Spanish'],
        yearsOfExperience: {
          infant: 3,
          toddler: 5,
        },
        hourlyRate: '$30',
      });

      expect(updated?.location).toBe('Los Angeles, CA');
      expect(updated?.status).toBe('complete');
      expect(updated?.qualifications).toEqual(['CPR', 'First Aid']);
      expect(updated?.languages).toEqual(['English', 'Spanish']);
      expect(updated?.yearsOfExperience).toEqual({
        infant: 3,
        toddler: 5,
      });
      expect(updated?.hourlyRate).toBe('$30');
    });

    it('should handle updates with null values', async () => {
      const caregiver = await createCaregiver();
      
      await updateCaregiver(caregiver.id, {
        location: 'Chicago, IL',
      });
      
      const updated = await updateCaregiver(caregiver.id, {
        location: null,
      });

      expect(updated?.location).toBeNull();
    });
  });

  describe('deleteCaregiver', () => {
    it('should delete an existing caregiver', async () => {
      const caregiver = await createCaregiver();
      
      const deleted = await deleteCaregiver(caregiver.id);
      expect(deleted).toBe(true);
      
      const retrieved = await getCaregiverById(caregiver.id);
      expect(retrieved).toBeNull();
    });

    it('should return false when deleting non-existent caregiver', async () => {
      const result = await deleteCaregiver('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('listAllCaregivers', () => {
    it('should return empty array when no caregivers exist', async () => {
      const caregivers = await listAllCaregivers();
      expect(caregivers).toEqual([]);
    });

    it('should return all caregivers', async () => {
      await createCaregiver('caregiver-1');
      await createCaregiver('caregiver-2');
      await createCaregiver('caregiver-3');
      
      const caregivers = await listAllCaregivers();
      
      expect(caregivers).toHaveLength(3);
      expect(caregivers.map(c => c.id)).toContain('caregiver-1');
      expect(caregivers.map(c => c.id)).toContain('caregiver-2');
      expect(caregivers.map(c => c.id)).toContain('caregiver-3');
    });

    it('should return caregivers with properly parsed fields', async () => {
      const created = await createCaregiver();
      await updateCaregiver(created.id, {
        qualifications: ['CPR'],
        languages: ['English'],
        yearsOfExperience: { infant: 2 },
      });
      
      const caregivers = await listAllCaregivers();
      const caregiver = caregivers[0];
      
      expect(Array.isArray(caregiver.qualifications)).toBe(true);
      expect(Array.isArray(caregiver.languages)).toBe(true);
      expect(typeof caregiver.yearsOfExperience).toBe('object');
      expect(caregiver.qualifications).toEqual(['CPR']);
      expect(caregiver.languages).toEqual(['English']);
      expect(caregiver.yearsOfExperience).toEqual({ infant: 2 });
    });
  });

  describe('End-to-End Workflow', () => {
    it('should support a complete caregiver onboarding flow', async () => {
      // Create new caregiver
      const caregiver = await createCaregiver();
      expect(caregiver.status).toBe('in_progress');
      
      // Update basic info
      let updated = await updateCaregiver(caregiver.id, {
        location: 'Seattle, WA',
        profilePictureUrl: 'https://example.com/photo.jpg',
      });
      expect(updated?.location).toBe('Seattle, WA');
      
      // Add qualifications and languages
      updated = await updateCaregiver(caregiver.id, {
        qualifications: ['CPR', 'First Aid'],
        languages: ['English'],
      });
      expect(updated?.qualifications).toHaveLength(2);
      
      // Add more languages (should merge)
      updated = await updateCaregiver(caregiver.id, {
        languages: ['Spanish'],
      });
      expect(updated?.languages).toHaveLength(2);
      
      // Add experience
      updated = await updateCaregiver(caregiver.id, {
        yearsOfExperience: {
          infant: 3,
          toddler: 5,
        },
      });
      
      // Add preferences and complete
      updated = await updateCaregiver(caregiver.id, {
        preferredAgeGroups: ['infant', 'toddler'],
        careTypes: ['full-time'],
        hourlyRate: '$28',
        status: 'complete',
      });
      
      // Verify final state
      const final = await getCaregiverById(caregiver.id);
      expect(final?.status).toBe('complete');
      expect(final?.location).toBe('Seattle, WA');
      expect(final?.qualifications).toEqual(['CPR', 'First Aid']);
      expect(final?.languages).toEqual(['English', 'Spanish']);
      expect(final?.yearsOfExperience).toEqual({ infant: 3, toddler: 5 });
      expect(final?.preferredAgeGroups).toEqual(['infant', 'toddler']);
      expect(final?.careTypes).toEqual(['full-time']);
      expect(final?.hourlyRate).toBe('$28');
    });
  });
});

