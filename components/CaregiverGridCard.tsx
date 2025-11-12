'use client';

import { CaregiverProfile } from '@/db/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CaregiverGridCardProps {
  caregiver: CaregiverProfile;
}

export function CaregiverGridCard({ caregiver }: CaregiverGridCardProps) {
  const router = useRouter();

  const calculateCompletion = (): number => {
    const fields = [
      caregiver.location,
      caregiver.profilePictureUrl,
      caregiver.qualifications.length > 0 ? caregiver.qualifications : null,
      caregiver.languages.length > 0 ? caregiver.languages : null,
      caregiver.preferredAgeGroups.length > 0 ? caregiver.preferredAgeGroups : null,
      caregiver.dietaryPreferences.length > 0 ? caregiver.dietaryPreferences : null,
      caregiver.responsibilities.length > 0 ? caregiver.responsibilities : null,
      caregiver.benefitsRequired.length > 0 ? caregiver.benefitsRequired : null,
      caregiver.careTypes.length > 0 ? caregiver.careTypes : null,
      caregiver.startDate,
      caregiver.generalAvailability,
      caregiver.weeklyHours,
      caregiver.commuteDistance,
      caregiver.commuteType,
      caregiver.willDriveChildren,
      caregiver.accessibilityNeeds,
      Object.keys(caregiver.yearsOfExperience).length > 0 ? caregiver.yearsOfExperience : null,
      caregiver.hourlyRate,
      caregiver.additionalChildRate,
      caregiver.payrollRequired,
    ];

    const filledFields = fields.filter((field) => field !== null && field !== undefined).length;
    const totalFields = fields.length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const completionPercentage = calculateCompletion();

  const getStatusInfo = (): { label: string; className: string } => {
    switch (caregiver.status) {
      case 'complete':
        return {
          label: 'Complete',
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      default:
        return {
          label: 'In Progress',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleClick = () => {
    router.push(`/chat/${caregiver.id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-gray-200 dark:border-gray-800"
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarFallback className="bg-blue-500 text-white">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Caregiver Profile
            </h3>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                  statusInfo.className
                )}
              >
                {statusInfo.label}
              </span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Updated {timeAgo(caregiver.updatedAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

