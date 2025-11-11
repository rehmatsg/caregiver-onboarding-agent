import { NextRequest, NextResponse } from 'next/server';
import { getCaregiverById } from '@/db/caregivers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caregiverId } = await params;
    
    if (!caregiverId) {
      return NextResponse.json(
        { error: 'Caregiver ID is required' },
        { status: 400 }
      );
    }

    const caregiver = await getCaregiverById(caregiverId);
    
    if (!caregiver) {
      return NextResponse.json(
        { error: 'Caregiver not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(caregiver);
  } catch (error) {
    console.error('Error fetching caregiver:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

