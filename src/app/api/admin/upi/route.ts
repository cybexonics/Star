import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET current UPI and PUT to update it. Stored in 'settings' collection under key 'upi'.
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('star-tailors');

    const setting = await db.collection('settings').findOne({ key: 'upi' });
    const upi = setting?.value || '';

    return NextResponse.json({ success: true, upi }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching UPI:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('star-tailors');
    const body = await request.json();

    if (!body.upi || typeof body.upi !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid UPI' }, { status: 400 });
    }

    await db.collection('settings').updateOne(
      { key: 'upi' },
      { $set: { key: 'upi', value: body.upi, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, upi: body.upi }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating UPI:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
