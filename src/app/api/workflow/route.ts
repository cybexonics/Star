import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { mockDataStore } from '@/lib/mockData';

// CREATE a new workflow
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('star-tailors');
    const body = await request.json();

    if (!body.billId || !body.customerName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: billId and customerName' },
        { status: 400 }
      );
    }

    const workflow = {
      ...body,
      stage: body.stage || 'cutting',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('workflow').insertOne(workflow);

    return NextResponse.json(
      { success: true, data: { ...workflow, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating workflow:', error);

    // fallback to mock data
    try {
      const body = await request.json();
      const workflow = mockDataStore.createWorkflow({
        ...body,
        stage: body.stage || 'cutting',
      });

      return NextResponse.json(
        { success: true, data: workflow },
        { status: 201 }
      );
    } catch (mockError: any) {
      return NextResponse.json(
        { success: false, error: mockError.message },
        { status: 500 }
      );
    }
  }
}

// GET all workflows
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('star-tailors');

    const workflows = await db.collection('workflow').find({}).sort({ updatedAt: -1 }).toArray();
    const bills = await db.collection('bills').find({}).toArray();

    const enhancedWorkflows = workflows.map((workflow: any) => {
      const bill = bills.find((b: any) => b._id.toString() === workflow.billId);
      return { ...workflow, bill };
    });

    return NextResponse.json({
      success: true,
      data: { workflows: enhancedWorkflows },
    });
  } catch (error: any) {
    console.error('Error fetching workflows:', error);

    try {
      const workflows = mockDataStore.getWorkflows();
      const enhancedWorkflows = workflows.map((workflow) => {
        const bill = mockDataStore.getBillById(workflow.billId);
        return { ...workflow, bill };
      });

      return NextResponse.json({
        success: true,
        data: { workflows: enhancedWorkflows },
      });
    } catch (mockError: any) {
      return NextResponse.json(
        { success: false, error: mockError.message },
        { status: 500 }
      );
    }
  }
}

// UPDATE workflow by ID
export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('star-tailors');
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const result = await db
      .collection('workflow')
      .findOneAndUpdate({ _id: new ObjectId(body.id) }, { $set: updateData }, { returnDocument: 'after' });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

// DELETE workflow by ID
export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('star-tailors');
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    const result = await db.collection('workflow').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
