import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

// GET /api/bookings - Get all bookings
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    // Build query based on filters
    const query: Record<string, string> = {};
    if (userId) query.user = userId;
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('service', 'name duration price')
      .populate('user', 'name email')
      .sort({ date: -1 });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const booking = await Booking.create(body);

    // Populate service and user info before returning
    await booking.populate('service', 'name duration price');
    await booking.populate('user', 'name email');

    return NextResponse.json(
      { success: true, data: booking },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating booking:', error);

    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}