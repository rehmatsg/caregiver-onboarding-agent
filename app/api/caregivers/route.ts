import { NextResponse } from 'next/server';
import { createCaregiver } from '@/db/caregivers';

export async function POST() {
  try {
    const caregiver = await createCaregiver();
    return NextResponse.json(caregiver);
  } catch (error) {
    console.error('Error creating caregiver:', error);
    return NextResponse.json(
      { error: 'Failed to create caregiver' },
      { status: 500 }
    );
  }
}

