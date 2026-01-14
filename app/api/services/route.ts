import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Service from '@/models/Service';

// GET /api/services - Get all active services
export async function GET() {
  try {
    await dbConnect();

    const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST /api/services - Create a new service
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const service = await Service.create(body);

    return NextResponse.json(
      { success: true, data: service },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating service:', error);

    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    );
  }
}