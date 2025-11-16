'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WorkflowJob } from '@/types';
import { deleteJob } from '@/lib/api';

interface WorkflowWithBill extends WorkflowJob {
  bill?: any;
}

const stages = [
  { key: 'cutting', label: 'Cutting', color: 'bg-blue-500', bgColor: 'bg-blue-50', icon: '✂️' },
  { key: 'stitching', label: 'Stitching', color: 'bg-red-500', bgColor: 'bg-red-50', icon: '🧵' },
  { key: 'finishing', label: 'Finishing', color: 'bg-purple-500', bgColor: 'bg-purple-50', icon: '熨' },
  { key: 'packaging', label: 'Packaging', color: 'bg-green-500', bgColor: 'bg-green-50', icon: '📦' },
  { key: 'delivered', label: 'Delivered', color: 'bg-violet-500', bgColor: 'bg-violet-50', icon: '✅' }
];

const stageDescriptions = {
  cutting: "All garments start here. After cutting, they are routed to stitching based on garment type.",
  stitching: "Garments are stitched according to design specifications and measurements.",
  finishing: "Final touches, pressing, and quality checks are performed in this stage.",
  packaging: "Garments are carefully packaged and prepared for delivery to customers.",
  delivered: "Completed orders are moved to this stage after successful delivery."
};

export default function WorkflowPage() {
  const [workflows, setWorkflows] = useState<WorkflowWithBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('cutting');

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workflow');
      const data = await response.json();

      if (data.success) {
        setWorkflows(data.data.workflows);
        
        // Calculate stage counts
        const counts: Record<string, number> = {};
        stages.forEach(stage => {
          counts[stage.key] = data.data.workflows.filter((w: WorkflowWithBill) => w.stage === stage.key).length;
        });
        setStageCounts(counts);
      } else {
        console.error('Error fetching workflows:', data.error);
        alert('Failed to load workflow data: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (workflowId: string, customerName: string) => {
    if (!confirm(`Are you sure you want to delete the job for ${customerName}? This will also remove the associated bill. This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(workflowId);
    try {
      const response = await fetch(`/api/workflow/${workflowId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete job');
      }
      
      // Update local state to remove the deleted workflow immediately
      setWorkflows(prevWorkflows => {
        const updatedWorkflows = prevWorkflows.filter(workflow => workflow._id !== workflowId);
        
        // Recalculate stage counts based on the updated workflows
        const counts: Record<string, number> = {};
        stages.forEach(stage => {
          counts[stage.key] = updatedWorkflows.filter(w => w.stage === stage.key).length;
        });
        setStageCounts(counts);
        
        return updatedWorkflows;
      });
      
      alert('Job and associated bill deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job: ' + (error.message || 'Please try again.'));
    } finally {
      setDeleteLoading(null);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const moveToNextStage = async (workflowId: string, currentStage: string) => {
    const currentStageIndex = stages.findIndex(s => s.key === currentStage);
    if (currentStageIndex === -1 || currentStageIndex === stages.length - 1) return;

    const nextStage = stages[currentStageIndex + 1].key;

    try {
      const response = await fetch(`/api/workflow/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: nextStage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update workflow');
      }

      if (data.success) {
        fetchWorkflows(); // Refresh the data
      } else {
        alert('Error updating workflow: ' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error updating workflow: ' + (error.message || 'Please try again'));
    }
  };

  const moveToPreviousStage = async (workflowId: string, currentStage: string) => {
    const currentStageIndex = stages.findIndex(s => s.key === currentStage);
    if (currentStageIndex <= 0) return;

    const previousStage = stages[currentStageIndex - 1].key;

    try {
      const response = await fetch(`/api/workflow/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: previousStage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update workflow');
      }

      if (data.success) {
        fetchWorkflows(); // Refresh the data
      } else {
        alert('Error updating workflow: ' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error updating workflow: ' + (error.message || 'Please try again'));
    }
  };

  const getWorkflowsForStage = (stage: string) => {
    return workflows.filter(w => w.stage === stage);
  };

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

  // Get the active stage data
  const activeStage = stages.find(stage => stage.key === activeTab) || stages[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute right-0 top-1/4 w-96 h-96 rounded-full bg-purple-200 opacity-20 blur-3xl"></div>
        <div className="absolute right-1/3 top-1/2 w-64 h-64 rounded-full bg-pink-200 opacity-20 blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl shadow-lg p-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Garment Workflow Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Track garment production through all stages</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Welcome, Admin</span>
              <Link 
                href="/" 
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Workflow Stage Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {stages.map((stage) => (
            <div 
              key={stage.key} 
              className={`${stage.bgColor} rounded-2xl shadow-lg p-6 border border-gray-100 transition-all hover:shadow-xl`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{stage.icon}</span>
                <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{stage.label}</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {stageCounts[stage.key] || 0}
              </p>
            </div>
          ))}
        </div>

        {/* Main Workflow Container */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Tab Navigation Bar */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 pb-4">
            {stages.map((stage) => (
              <button
                key={stage.key}
                onClick={() => setActiveTab(stage.key)}
                className={`px-5 py-3 rounded-xl font-medium transition-all ${
                  activeTab === stage.key
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>

          {/* Stage Banner */}
          <div className={`rounded-2xl p-6 mb-8 ${activeStage.bgColor} border border-gray-100`}>
            <p className="text-gray-700">{stageDescriptions[activeTab as keyof typeof stageDescriptions]}</p>
          </div>

          {/* Stage Content Area */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading workflows...</p>
            </div>
          ) : (
            <div>
              {getWorkflowsForStage(activeTab).length === 0 ? (
                // Empty State
                <div className="text-center py-16">
                  <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                    <span className="text-3xl">📭</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No jobs in this stage</h3>
                  <p className="text-gray-600">There are currently no garments in the {activeStage.label} stage.</p>
                </div>
              ) : (
                // Job Cards
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getWorkflowsForStage(activeTab).map((workflow) => (
                    <div 
                      key={workflow._id} 
                      className="border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all bg-white"
                    >
                      {/* Job Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            Order {generateCustomerId(workflow.billId)} – {workflow.customerName}
                          </h3>
                          {workflow.bill && (
                            <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {workflow.bill.garmentType}
                            </span>
                          )}
                          {workflow.bill && (
                            <p className="text-sm text-gray-600 mt-1">
                              Due: {formatDate(workflow.bill.dueDate)}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          workflow.stage === 'delivered' ? 'bg-green-100 text-green-800' :
                          workflow.stage === 'cutting' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {workflow.stage === 'delivered' ? 'Completed' :
                           workflow.stage === 'cutting' ? 'Pending' : 'In Progress'}
                        </span>
                      </div>

                      {/* Job Details - Three Column Layout */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Customer Details */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Customer Details</h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600">Name: {workflow.customerName}</p>
                            {workflow.bill && (
                              <>
                                <p className="text-gray-600">Phone: {workflow.bill.phone}</p>
                                <p className="text-gray-600">Email: -</p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Bill Information */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Bill Information</h4>
                          {workflow.bill && (
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-600">Bill #: {generateCustomerId(workflow.billId)}</p>
                              <p className="text-gray-600">Total: ₹{(workflow.bill.rate * workflow.bill.quantity).toFixed(2)}</p>
                              <p className="text-gray-600">Advance: ₹{(workflow.bill.rate * workflow.bill.quantity - workflow.bill.balance).toFixed(2)}</p>
                              <p className="text-gray-600">Balance: ₹{workflow.bill.balance.toFixed(2)}</p>
                            </div>
                          )}
                        </div>

                        {/* Measurements */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Measurements</h4>
                          {workflow.bill && workflow.bill.measurements && (
                            <div className="space-y-1 text-sm">
                              {Object.entries(workflow.bill.measurements)
                                .filter(([_, value]) => value)
                                .slice(0, 4)
                                .map(([key, value]) => (
                                  <p key={key} className="text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}: {String(value)}"
                                  </p>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Design Images */}
                      {workflow.bill?.images && workflow.bill.images.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Design Images</h4>
                          <div className="flex flex-wrap gap-2">
                            {workflow.bill.images.slice(0, 4).map((img: string, idx: number) => (
                              <div key={idx} className={`p-2 rounded-xl ${activeStage.bgColor} border border-gray-100`}>
                                <img 
                                  src={img} 
                                  alt={`Design ${idx + 1}`} 
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200" 
                                />
                              </div>
                            ))}
                            {workflow.bill.images.length > 4 && (
                              <div className={`w-16 h-16 rounded-xl ${activeStage.bgColor} border border-gray-100 flex items-center justify-center`}>
                                <span className="text-xs font-medium text-gray-600">+{workflow.bill.images.length - 4}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleDeleteJob(workflow._id!, workflow.customerName)}
                          disabled={deleteLoading === workflow._id}
                          className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {deleteLoading === workflow._id ? 'Deleting...' : 'Delete Job'}
                        </button>
                        
                        {activeTab !== 'delivered' && (
                          <button
                            onClick={() => moveToNextStage(workflow._id!, workflow.stage)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-purple-700 hover:to-pink-600"
                          >
                            {activeTab === 'cutting' ? 'Start Cutting' :
                             activeTab === 'stitching' ? 'Ready to Finish' :
                             activeTab === 'finishing' ? 'Ready to Package' :
                             activeTab === 'packaging' ? 'Mark as Delivered' :
                             'Complete'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}