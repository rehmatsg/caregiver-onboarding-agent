'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    try {
      setIsLoading(true);
      // Create a new caregiver
      const response = await fetch('/api/caregivers', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create caregiver');
      }

      const data = await response.json();
      // Navigate to chat page with the caregiver ID
      router.push(`/chat/${data.id}`);
    } catch (error) {
      console.error('Error creating caregiver:', error);
      alert('Failed to start. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold text-zinc-900 dark:text-zinc-50">
          Hi there!
        </h1>
        <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
          I'll help you set up your caregiver profile
        </p>
        <button
          onClick={handleGetStarted}
          disabled={isLoading}
          className="rounded-full bg-zinc-900 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-zinc-700 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:hover:bg-zinc-50"
        >
          {isLoading ? 'Starting...' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}
