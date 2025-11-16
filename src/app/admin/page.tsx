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
  const [upi, setUpi] = useState('');
  const [upiSaving, setUpiSaving] = useState(false);

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

  // fetch current UPI separately
  const fetchUpi = async () => {
    try {
      const res = await fetch('/api/admin/upi');
      const data = await res.json();
      if (data.success) setUpi(data.upi || '');
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUpi();
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
        return 'badge-pending';
      case 'in-progress':
        return 'badge-progress';
      case 'completed':
        return 'badge-completed';
      case 'delivered':
        return 'badge-delivered';
      default:
        return 'bg-surface-100 text-text-muted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-100 flex items-center justify-center">
        <div className="card text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 p-4 md:p-6 relative overflow-hidden">
      {/* Background elements similar to homepage */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute right-0 top-1/4 w-64 h-64 rounded-full bg-purple-300 opacity-10 blur-3xl"></div>
        <div className="absolute right-1/4 top-1/2 w-48 h-48 rounded-full bg-pink-300 opacity-10 blur-3xl"></div>
        <div className="absolute right-1/3 bottom-1/4 w-32 h-32 rounded-full bg-purple-200 opacity-10 blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="heading-lg">Admin Dashboard</h1>
              <p className="text-text-muted text-sm mt-1">Manage bills, workflow, and system settings</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/billing" className="block w-full sm:w-auto text-center py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-purple-700 hover:to-pink-600">
                Billing System
              </Link>
              <Link href="/workflow" className="block w-full sm:w-auto text-center py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-purple-700 hover:to-pink-600">
                Workflow Management
              </Link>
              <Link href="/" className="block w-full sm:w-auto text-center py-3 px-6 bg-white text-gray-800 rounded-xl font-semibold shadow border border-gray-200 hover:shadow-md transition-all duration-300">
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="label text-sm">Total Customers</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{stats?.totalCustomers || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{stats?.activeOrders || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zM9 13H7a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2zM17 5h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zM17 13h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{stats?.completedOrders || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">₹{stats?.revenue.toFixed(2) || '0.00'}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* UPI Management */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">UPI for Payments</h2>
              <p className="text-sm text-gray-600 mt-1">Customers will scan this UPI to pay balances. Change it to update QR on new bills.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
                placeholder="example@bank"
                className="input-field w-full sm:w-64 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={async () => {
                  if (!confirm('Update UPI for future bills?')) return;
                  setUpiSaving(true);
                  try {
                    const res = await fetch('/api/admin/upi', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ upi })
                    });
                    const data = await res.json();
                    if (data.success) {
                      alert('UPI updated successfully');
                    } else {
                      alert('Failed to update UPI: ' + (data.error || 'Unknown'));
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Failed to update UPI');
                  } finally {
                    setUpiSaving(false);
                  }
                }}
                className="py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-purple-700 hover:to-pink-600"
                disabled={upiSaving}
              >
                {upiSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Stages Overview */}
        {stats?.workflowStages && Object.keys(stats.workflowStages).length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-6">Workflow Stages</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: 'cutting', label: 'Cutting', gradient: 'from-purple-500 to-pink-400' },
                { key: 'stitching', label: 'Stitching', gradient: 'from-purple-600 to-pink-500' },
                { key: 'finishing', label: 'Finishing', gradient: 'from-purple-700 to-pink-600' },
                { key: 'packaging', label: 'Packaging', gradient: 'from-purple-800 to-pink-700' },
                { key: 'delivered', label: 'Delivered', gradient: 'from-purple-900 to-pink-800' }
              ].map((stage) => (
                <div 
                  key={stage.key} 
                  className={`bg-gradient-to-r ${stage.gradient} text-white rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow duration-300`}
                >
                  <div className="text-2xl font-bold">{stats.workflowStages[stage.key] || 0}</div>
                  <div className="text-sm font-medium mt-1">{stage.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Bills */}
        {stats?.recentBills && stats.recentBills.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Recent Bills</h2>
                <Link
                  href="/billing/list"
                  className="text-purple-600 hover:text-pink-600 font-semibold transition-colors"
                >
                  View All →
                </Link>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Customer ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Garment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-100">
                  {stats.recentBills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-white/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                        {bill._id ? generateCustomerId(bill._id) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bill.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                        {bill.garmentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₹{bill.balance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(bill.status)}`}>
                          {bill.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(bill.createdAt.toString())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteBill(bill._id!, bill.customerName)}
                          disabled={deleteLoading === bill._id}
                          className="py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg text-xs font-semibold shadow hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 hover:from-purple-700 hover:to-pink-600 disabled:opacity-50"
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