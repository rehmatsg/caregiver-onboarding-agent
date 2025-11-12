import { NextResponse } from 'next/server';
import { createCaregiver, listAllCaregivers } from '@/db/caregivers';

export async function GET() {
  try {
    const caregivers = await listAllCaregivers();
    return NextResponse.json(caregivers);
  } catch (error) {
    console.error('Error fetching caregivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch caregivers' },
      { status: 500 }
    );
  }
}

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

