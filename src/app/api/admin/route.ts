import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { mockDataStore } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('star-tailors');
    
    // Get total customers (unique customer names from bills)
    const totalCustomersResult = await db.collection('bills').aggregate([
      {
        $group: {
          _id: "$customerName"
        }
      },
      {
        $count: "totalCustomers"
      }
    ]).toArray();
    
    const totalCustomers = totalCustomersResult[0]?.totalCustomers || 0;
    
    // Get active orders (not completed or delivered)
    const activeOrders = await db.collection('bills').countDocuments({
      status: { $nin: ['completed', 'delivered'] }
    });
    
    // Get completed orders
    const completedOrders = await db.collection('bills').countDocuments({
      status: { $in: ['completed', 'delivered'] }
    });
    
    // Calculate total revenue (sum of all subtotals)
    const revenueResult = await db.collection('bills').aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$subtotal" }
        }
      }
    ]).toArray();
    
    const revenue = revenueResult[0]?.totalRevenue || 0;
    
    // Get recent bills
    const recentBills = await db.collection('bills')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    // Get workflow stage counts
    const workflowStages = await db.collection('workflow').aggregate([
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const stats = {
      totalCustomers,
      activeOrders,
      completedOrders,
      revenue: parseFloat(revenue.toFixed(2)),
      recentBills,
      workflowStages: workflowStages.reduce((acc, stage) => {
        acc[stage._id] = stage.count;
        return acc;
      }, {} as Record<string, number>)
    };
    
    return NextResponse.json({ 
      success: true, 
      data: stats 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    
    // Fallback to mock data
    try {
      const stats = mockDataStore.getAdminStats();
      
      return NextResponse.json({ 
        success: true, 
        data: stats 
      }, { status: 200 });
      
    } catch (mockError: any) {
      return NextResponse.json(
        { success: false, error: mockError.message },
        { status: 500 }
      );
    }
  }
}