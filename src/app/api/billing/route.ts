import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { mockDataStore } from '@/lib/mockData';

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('star-tailors');
    const body = await request.json();
    
    // Validate required fields
    if (!body.customerName || !body.phone || !body.garmentType || !body.quantity || !body.rate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Calculate subtotal and balance
    const subtotal = body.quantity * body.rate;
    const balance = subtotal - (body.advance || 0);
    
    const billData = {
      ...body,
      subtotal,
      balance,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const billResult = await db.collection('bills').insertOne(billData);
    const bill = { ...billData, _id: billResult.insertedId };
    
    // Automatically create workflow entry
    const workflowData = {
      billId: bill._id.toString(),
      customerName: bill.customerName,
      stage: 'cutting',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const workflowResult = await db.collection('workflow').insertOne(workflowData);
    
    return NextResponse.json({ 
      success: true, 
      data: bill
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating bill:', error);
    
    // Fallback to mock data
    try {
      const body = await request.json();
      
      // Validate required fields
      if (!body.customerName || !body.phone || !body.garmentType || !body.quantity || !body.rate) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }
      
      // Calculate subtotal and balance
      const subtotal = body.quantity * body.rate;
      const balance = subtotal - (body.advance || 0);
      
      const billData = {
        ...body,
        subtotal,
        balance,
        status: 'pending' as const,
        dueDate: new Date(body.dueDate),
        images: body.images || [],
        drawings: body.drawings || []
      };
      
      const bill = mockDataStore.createBill(billData);
      
      // Automatically create workflow entry
      const workflow = mockDataStore.createWorkflow({
        billId: bill._id,
        customerName: bill.customerName,
        stage: 'cutting'
      });
      
      return NextResponse.json({ 
        success: true, 
        data: bill 
      }, { status: 201 });
      
    } catch (mockError: any) {
      return NextResponse.json(
        { success: false, error: mockError.message },
        { status: 500 }
      );
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('star-tailors');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    let query: any = {};
    if (search) {
      query = {
        $or: [
          { customerName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const bills = await db.collection('bills').find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .toArray();
    
    const total = await db.collection('bills').countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        bills,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching bills:', error);
    
    // Fallback to mock data
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search') || '';
      
      let query = {};
      if (search) {
        query = {
          $or: [
            { customerName: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        };
      }
      
      const bills = mockDataStore.getBills(query, {
        skip: (page - 1) * limit,
        limit: limit
      });
      
      const total = mockDataStore.countBills(query);
      
      return NextResponse.json({
        success: true,
        data: {
          bills,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
      
    } catch (mockError: any) {
      return NextResponse.json(
        { success: false, error: mockError.message },
        { status: 500 }
      );
    }
  }
}