'use client';

import { CaregiverProfile } from '@/db/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaregiverProfileCardProps {
  caregiver: CaregiverProfile | null;
}

export function CaregiverProfileCard({
  caregiver,
}: CaregiverProfileCardProps) {
  if (!caregiver) {
    return null;
  }

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
    if (completionPercentage === 100) {
      return {
        label: 'Complete',
        className: 'bg-green-100 text-green-800 border-green-200',
      };
    }
    if (completionPercentage >= 80) {
      return {
        label: 'Nearly Complete',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    }
    return {
      label: 'In Progress',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
  };

  const statusInfo = getStatusInfo();

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => {
    return (
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {title}
        </h4>
        <div className="space-y-2">{children}</div>
      </div>
    );
  };

  const Field = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="text-sm">
        <span className="font-medium text-gray-700">{label}:</span>{' '}
        <span className="text-gray-900">{value}</span>
      </div>
    );
  };

  const ArrayField = ({
    label,
    values,
  }: {
    label: string;
    values: string[];
  }) => {
    if (!values || values.length === 0) return null;
    return (
      <div className="text-sm">
        <span className="font-medium text-gray-700">{label}:</span>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {values.map((value, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs"
            >
              {value}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
      <Card
        className="h-full overflow-hidden rounded-none border-0 bg-transparent flex flex-col"
        style={{ boxShadow: 'none' }}
      >
        <>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-500 text-white">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">Your Profile</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-1 rounded-4xl text-xs font-medium border',
                        statusInfo.className
                      )}
                    >
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {completionPercentage}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="overflow-y-auto flex-1">
              <Section title="Basic Information">
                <Field label="Location" value={caregiver.location} />
                <ArrayField label="Languages" values={caregiver.languages} />
                <ArrayField label="Qualifications" values={caregiver.qualifications} />
              </Section>

              {Object.keys(caregiver.yearsOfExperience).length > 0 && (
                <Section title="Experience">
                  {Object.entries(caregiver.yearsOfExperience).map(([ageGroup, years]) => (
                    <Field
                      key={ageGroup}
                      label={ageGroup}
                      value={`${years} years`}
                    />
                  ))}
                </Section>
              )}

              {(caregiver.preferredAgeGroups.length > 0 ||
                caregiver.careTypes.length > 0 ||
                caregiver.responsibilities.length > 0) && (
                <Section title="Care Preferences">
                  <ArrayField
                    label="Preferred Age Groups"
                    values={caregiver.preferredAgeGroups}
                  />
                  <ArrayField label="Care Types" values={caregiver.careTypes} />
                  <ArrayField
                    label="Responsibilities"
                    values={caregiver.responsibilities}
                  />
                  <ArrayField
                    label="Dietary Preferences"
                    values={caregiver.dietaryPreferences}
                  />
                </Section>
              )}

              {(caregiver.startDate ||
                caregiver.generalAvailability ||
                caregiver.weeklyHours) && (
                <Section title="Availability">
                  <Field label="Start Date" value={caregiver.startDate} />
                  <Field
                    label="General Availability"
                    value={caregiver.generalAvailability}
                  />
                  <Field label="Weekly Hours" value={caregiver.weeklyHours} />
                </Section>
              )}

              {(caregiver.commuteDistance ||
                caregiver.commuteType ||
                caregiver.willDriveChildren) && (
                <Section title="Commute & Transportation">
                  <Field label="Commute Distance" value={caregiver.commuteDistance} />
                  <Field label="Commute Type" value={caregiver.commuteType} />
                  <Field
                    label="Will Drive Children"
                    value={caregiver.willDriveChildren}
                  />
                </Section>
              )}

              {(caregiver.hourlyRate ||
                caregiver.additionalChildRate ||
                caregiver.payrollRequired) && (
                <Section title="Compensation">
                  <Field label="Hourly Rate" value={caregiver.hourlyRate} />
                  <Field
                    label="Additional Child Rate"
                    value={caregiver.additionalChildRate}
                  />
                  <Field label="Payroll Required" value={caregiver.payrollRequired} />
                </Section>
              )}

              {(caregiver.benefitsRequired.length > 0 ||
                caregiver.accessibilityNeeds) && (
                <Section title="Benefits & Accessibility">
                  <ArrayField
                    label="Benefits Required"
                    values={caregiver.benefitsRequired}
                  />
                  <Field
                    label="Accessibility Needs"
                    value={caregiver.accessibilityNeeds}
                  />
                </Section>
              )}
            </CardContent>
          </>
      </Card>
    </div>
  );
}

