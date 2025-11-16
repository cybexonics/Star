'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bill } from '@/types';

export default function BillingListPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBills = async (page = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/billing?${params}`);
      const data = await response.json();

      if (data.success) {
        setBills(data.data.bills);
        setTotalPages(data.data.pagination.pages);
        setCurrentPage(data.data.pagination.page);
      } else {
        console.error('Error fetching bills:', data.error);
        alert('Failed to load bills: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills(currentPage, search);
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBills(1, search);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const generateCustomerId = (bill: Bill) => {
    if (bill._id) {
      return `ST${bill._id.slice(-6).toUpperCase()}`;
    }
    return 'N/A';
  };

  return (
    <div className="min-h-screen bg-surface-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="heading-lg">Recent Bills</h1>
              <p className="text-text-muted text-sm mt-1">View and manage all customer bills</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/billing" className="btn-primary text-center">New Bill</Link>
              <Link href="/" className="btn-secondary text-center">Back to Home</Link>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by customer name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field flex-1"
            />
            <button
              type="submit"
              className="btn-primary"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                  fetchBills(1, '');
                }}
                className="btn-secondary"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Bills Table */}
        <div className="bg-surface rounded-md shadow-soft border border-surface-border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
              <p className="mt-4 text-text-muted">Loading bills...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              {search ? 'No bills found matching your search.' : 'No bills found.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-surface-border">
                  <thead className="bg-brand-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-brand-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-brand-700 uppercase tracking-wider">
                        Customer ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-brand-700 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-brand-700 uppercase tracking-wider">
                        Garment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-brand-700 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-brand-700 uppercase tracking-wider">
                        Advance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-brand-700 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-brand-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-brand-700 uppercase tracking-wider">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface divide-y divide-surface-border">
                    {bills.map((bill) => (
                      <tr key={bill._id} className="hover:bg-surface-100 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          {formatDate(bill.createdAt.toString())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-600">
                          {generateCustomerId(bill)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                          {bill.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary capitalize">
                          {bill.garmentType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          ₹{bill.subtotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          ₹{bill.advance.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-600">
                          ₹{bill.balance.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(bill.status)}`}>
                            {bill.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          {formatDate(bill.dueDate.toString())}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-surface-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center">
                    <p className="text-sm text-text-primary">
                      Page {currentPage} of {totalPages}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-surface-border rounded-md text-sm font-medium text-text-primary bg-surface hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-brand-600 text-white border-brand-600'
                                : 'text-text-primary bg-surface border-surface-border hover:bg-surface-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 py-1 text-text-muted">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-surface-border rounded-md text-sm font-medium text-text-primary bg-surface hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}