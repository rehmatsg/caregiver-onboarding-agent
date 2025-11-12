'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function GetStartedButton() {
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
    <button
      onClick={handleGetStarted}
      disabled={isLoading}
      className="rounded-full bg-zinc-900 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-zinc-700 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:hover:bg-zinc-50"
    >
      {isLoading ? 'Starting...' : 'Get Started'}
    </button>
  );
}

