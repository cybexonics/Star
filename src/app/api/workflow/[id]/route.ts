import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Update (overwrite fields)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('star-tailors');
    const { id } = params;
    const body = await req.json();

    const result = await db.collection('workflow').updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('Error updating workflow:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Mark as completed (safe partial update)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('star-tailors');
    const { id } = params;

    const result = await db.collection('workflow').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'Completed', completedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('Error marking workflow completed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Delete job
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('star-tailors');
    const { id } = params;

    const result = await db.collection('workflow').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('Error deleting workflow:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}