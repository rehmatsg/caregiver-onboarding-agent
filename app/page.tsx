import { listAllCaregivers } from '@/db/caregivers';
import { CaregiverGridCard } from '@/components/CaregiverGridCard';
import { GetStartedButton } from '@/components/GetStartedButton';

export default async function Home() {
  const caregivers = await listAllCaregivers();

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="mb-4 text-5xl font-bold text-zinc-900 dark:text-zinc-50">
            Caregiver Profiles
          </h1>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            Manage and view all your caregiver profiles
          </p>
          <GetStartedButton />
        </div>

        {caregivers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-4">
              No caregiver profiles yet
            </p>
            <p className="text-zinc-500 dark:text-zinc-500">
              Click "Get Started" above to create your first profile
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caregivers.map((caregiver) => (
              <CaregiverGridCard key={caregiver.id} caregiver={caregiver} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
