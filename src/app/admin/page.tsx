'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminStats, Bill } from '@/types';
import { deleteBill } from '@/lib/api';

interface AdminStatsWithBills extends AdminStats {
  recentBills: Bill[];
  workflowStages: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatsWithBills | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleDeleteBill = async (billId: string, customerName: string) => {
    if (!confirm(`Are you sure you want to delete the bill for ${customerName}? This will also remove any related workflow jobs. This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(billId);
    try {
      await deleteBill(billId);
      
      // Update the state to remove the deleted bill immediately
      setStats(prevStats => {
        if (!prevStats) return prevStats;
        return {
          ...prevStats,
          recentBills: prevStats.recentBills.filter(bill => bill._id !== billId),
          activeOrders: Math.max(0, prevStats.activeOrders - 1),
          totalCustomers: prevStats.totalCustomers
        };
      });
      
      alert('Bill and related data deleted successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete bill. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        console.error('Error fetching stats:', data.error);
        alert('Failed to load dashboard data: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const generateCustomerId = (billId: string) => {
    return `ST${billId.slice(-6).toUpperCase()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D6D] mx-auto"></div>
          <p className="mt-4 text-[#800F2F]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="heading text-3xl">Admin Dashboard</h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/billing"
                className="btn-primary text-center"
              >
                Billing System
              </Link>
              <Link
                href="/workflow"
                className="btn-primary text-center"
              >
                Workflow Management
              </Link>
              <Link
                href="/"
                className="btn-primary text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="label text-sm">Total Customers</p>
                <p className="text-3xl font-bold text-[#FF4D6D]">{stats?.totalCustomers || 0}</p>
              </div>
              <div className="p-3 bg-[#FFB3C1] rounded-full">
                <svg className="w-6 h-6 text-[#590D22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-3xl font-bold text-[#C9184A]">{stats?.activeOrders || 0}</p>
              </div>
              <div className="p-3 bg-[#FF8FA3] rounded-full">
                <svg className="w-6 h-6 text-[#590D22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zM9 13H7a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2zM17 5h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zM17 13h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-3xl font-bold text-[#A4133C]">{stats?.completedOrders || 0}</p>
              </div>
              <div className="p-3 bg-[#FF758F] rounded-full">
                <svg className="w-6 h-6 text-[#590D22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-[#800F2F]">₹{stats?.revenue.toFixed(2) || '0.00'}</p>
              </div>
              <div className="p-3 bg-[#C9184A] rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Stages Overview */}
        {stats?.workflowStages && Object.keys(stats.workflowStages).length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#FFCCD5] mb-8">
            <h2 className="text-2xl font-bold text-[#590D22] mb-6">Workflow Stages</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: 'cutting', label: 'Cutting', color: 'bg-[#FF4D6D]' },
                { key: 'stitching', label: 'Stitching', color: 'bg-[#C9184A]' },
                { key: 'finishing', label: 'Finishing', color: 'bg-[#A4133C]' },
                { key: 'packaging', label: 'Packaging', color: 'bg-[#800F2F]' },
                { key: 'delivered', label: 'Delivered', color: 'bg-[#590D22]' }
              ].map((stage) => (
                <div key={stage.key} className={`${stage.color} text-white rounded-xl p-4 text-center`}>
                  <div className="text-2xl font-bold">{stats.workflowStages[stage.key] || 0}</div>
                  <div className="text-sm font-medium mt-1">{stage.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Bills */}
        {stats?.recentBills && stats.recentBills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-[#FFCCD5] overflow-hidden">
            <div className="p-6 border-b border-[#FFCCD5]">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#590D22]">Recent Bills</h2>
                <Link
                  href="/billing/list"
                  className="text-[#FF4D6D] hover:text-[#C9184A] font-semibold transition-colors"
                >
                  View All →
                </Link>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#FFCCD5]">
                <thead className="bg-[#FFB3C1]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#590D22] uppercase tracking-wider">
                      Customer ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#590D22] uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#590D22] uppercase tracking-wider">
                      Garment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#590D22] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#590D22] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#590D22] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#590D22] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#FFCCD5]">
                  {stats.recentBills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-[#FFF0F3] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#FF4D6D]">
                        {bill._id ? generateCustomerId(bill._id) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#590D22]">
                        {bill.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#800F2F] capitalize">
                        {bill.garmentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#590D22]">
                        ₹{bill.balance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(bill.status)}`}>
                          {bill.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#800F2F]">
                        {formatDate(bill.createdAt.toString())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteBill(bill._id!, bill.customerName)}
                          disabled={deleteLoading === bill._id}
                          className="bg-[#FF4D6D] text-white px-3 py-1 rounded text-xs hover:bg-[#C9184A] disabled:opacity-50 transition-colors"
                        >
                          {deleteLoading === bill._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}