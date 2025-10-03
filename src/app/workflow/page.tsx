'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WorkflowJob } from '@/types';
import { deleteJob } from '@/lib/api';

interface WorkflowWithBill extends WorkflowJob {
  bill?: any;
}

const stages = [
  { key: 'cutting', label: 'Cutting', color: 'bg-[#FF4D6D]' },
  { key: 'stitching', label: 'Stitching', color: 'bg-[#C9184A]' },
  { key: 'finishing', label: 'Finishing', color: 'bg-[#A4133C]' },
  { key: 'packaging', label: 'Packaging', color: 'bg-[#800F2F]' },
  { key: 'delivered', label: 'Delivered', color: 'bg-[#590D22]' }
];

export default function WorkflowPage() {
  const [workflows, setWorkflows] = useState<WorkflowWithBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-[#FFCCD5] p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold text-[#590D22]">Garment Workflow Dashboard</h1>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/billing"
                className="bg-gradient-to-r from-[#FF4D6D] to-[#A4133C] hover:from-[#C9184A] hover:to-[#800F2F] text-white px-6 py-2 rounded-md font-medium shadow-md transition-all duration-200 text-center"
              >
                Create New Bill
              </Link>
              <Link
                href="/"
                className="bg-gradient-to-r from-[#FF4D6D] to-[#A4133C] hover:from-[#C9184A] hover:to-[#800F2F] text-white px-6 py-2 rounded-md font-medium shadow-md transition-all duration-200 text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-md p-8 text-center shadow-sm border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading workflows...</p>
          </div>
        ) : (
          /* Workflow Stages - Stacked Full-Width Sections */
          <div className="space-y-8">
            {stages.map((stage) => {
              const stageWorkflows = getWorkflowsForStage(stage.key);
              
              // Stage descriptions
              const stageDescriptions = {
                cutting: "All garments start here. After cutting, they are routed to stitching.",
                stitching: "Garments are stitched based on type, before finishing.",
                finishing: "Final touches are applied here before packaging.",
                packaging: "Garments are packed and prepared for delivery.",
                delivered: "Completed jobs are moved here."
              };
              
              return (
                <div key={stage.key} className="bg-white rounded-md shadow-sm border border-gray-200">
                  {/* Stage Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{stage.label}</h2>
                      <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                        stage.key === 'cutting' ? 'bg-[#FFB3C1] text-[#590D22]' :
                        stage.key === 'stitching' ? 'bg-[#FF8FA3] text-[#590D22]' :
                        stage.key === 'finishing' ? 'bg-[#FF758F] text-[#590D22]' :
                        stage.key === 'packaging' ? 'bg-[#C9184A] text-white' :
                        'bg-[#590D22] text-white'
                      }`}>
                        {stageWorkflows.length} job{stageWorkflows.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {/* Description Banner */}
                    <div className={`p-3 rounded-md border text-sm italic ${
                      stage.key === 'cutting' ? 'bg-[#FFB3C1] border-[#FF8FA3] text-[#590D22]' :
                      stage.key === 'stitching' ? 'bg-[#FF8FA3] border-[#FF758F] text-[#590D22]' :
                      stage.key === 'finishing' ? 'bg-[#FF758F] border-[#C9184A] text-[#590D22]' :
                      stage.key === 'packaging' ? 'bg-[#C9184A] border-[#A4133C] text-white' :
                      'bg-[#590D22] border-[#800F2F] text-white'
                    }`}>
                      {stageDescriptions[stage.key as keyof typeof stageDescriptions]}
                    </div>
                  </div>
                  
                  {/* Job Cards */}
                  <div className="p-6">
                    {stageWorkflows.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-400">No jobs in this stage</div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {stageWorkflows.map((workflow) => (
                          <div
                            key={workflow._id}
                            className="bg-white rounded-md border border-[#FFCCD5] shadow-sm hover:shadow-md transition-shadow p-6 border-t-4 border-t-[#FF4D6D]"
                          >
                            <div className="space-y-4">
                              {/* Order ID + Customer Name */}
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">
                                    Order {generateCustomerId(workflow.billId)}
                                  </h3>
                                  <p className="text-gray-600 font-medium">{workflow.customerName}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                                  stage.key === 'delivered' ? 'bg-[#590D22] text-white' :
                                  stage.key === 'cutting' ? 'bg-[#FFCCD5] text-[#590D22]' :
                                  'bg-[#FF8FA3] text-[#590D22]'
                                }`}>
                                  {stage.key === 'delivered' ? 'Completed' :
                                   stage.key === 'cutting' ? 'Pending' : 'In Progress'}
                                </span>
                              </div>
                              
                              {/* Garment Type */}
                              {workflow.bill && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-500">Garment Type:</span>
                                  <span className="text-gray-900 capitalize font-medium">{workflow.bill.garmentType}</span>
                                </div>
                              )}
                              
                              {/* Due Date */}
                              {workflow.bill && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-500">Due Date:</span>
                                  <span className="text-gray-900 font-medium">{formatDate(workflow.bill.dueDate)}</span>
                                </div>
                              )}
                              
                              {/* Bill Info */}
                              {workflow.bill && (
                                <div className="bg-gray-50 rounded-md p-4">
                                  <h4 className="text-sm font-bold text-gray-700 mb-3">Bill Information</h4>
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Total:</span>
                                      <div className="font-bold text-gray-900">₹{(workflow.bill.rate * workflow.bill.quantity).toFixed(2)}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Advance:</span>
                                      <div className="font-bold text-gray-900">₹{(workflow.bill.rate * workflow.bill.quantity - workflow.bill.balance).toFixed(2)}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Balance:</span>
                                      <div className="font-bold text-red-600">₹{workflow.bill.balance.toFixed(2)}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Measurements - Clean 2-Column Grid */}
                              {workflow.bill?.measurements && Object.values(workflow.bill.measurements).some(v => v) && (
                                <div>
                                  <h4 className="text-sm font-bold text-gray-700 mb-3">Measurements</h4>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    {Object.entries(workflow.bill.measurements)
                                      .filter(([key, value]) => value)
                                      .map(([key, value]) => (
                                        <div key={key} className="bg-gray-50 rounded-md p-3 flex justify-between">
                                          <span className="text-gray-600 capitalize">{key}:</span>
                                          <span className="font-medium text-gray-900">{value as number}"</span>
                                        </div>
                                      ))
                                    }
                                  </div>
                                </div>
                              )}
                              
                              {/* Design Images */}
                              {workflow.bill?.images && workflow.bill.images.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-bold text-gray-700 mb-2">Design Images</h4>
                                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                    <span>{workflow.bill.images.length} image{workflow.bill.images.length !== 1 ? 's' : ''} attached</span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Tailor Notes */}
                              {workflow.bill?.tailorNotes && (
                                <div>
                                  <h4 className="text-sm font-bold text-gray-700 mb-2">Tailor Notes</h4>
                                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                                    {workflow.bill.tailorNotes}
                                  </div>
                                </div>
                              )}
                              
                              {/* Action Buttons */}
                              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                  onClick={() => handleDeleteJob(workflow._id!, workflow.customerName)}
                                  disabled={deleteLoading === workflow._id}
                                  className="bg-[#FF4D6D] hover:bg-[#C9184A] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  {deleteLoading === workflow._id ? 'Deleting...' : 'Delete'}
                                </button>
                                {stage.key !== 'cutting' && (
                                  <button
                                    onClick={() => moveToPreviousStage(workflow._id!, workflow.stage)}
                                    className="bg-[#FFCCD5] hover:bg-[#FFB3C1] text-[#590D22] px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                  >
                                    ← Back
                                  </button>
                                )}
                                {stage.key !== 'delivered' && (
                                  <button
                                    onClick={() => moveToNextStage(workflow._id!, workflow.stage)}
                                    className="bg-gradient-to-r from-[#FF4D6D] to-[#A4133C] hover:from-[#C9184A] hover:to-[#800F2F] text-white px-4 py-2 rounded-md text-sm font-medium shadow-md transition-all duration-200"
                                  >
                                    {stage.key === 'cutting' ? 'Start Cutting' :
                                     stage.key === 'stitching' ? 'Mark as Complete' :
                                     stage.key === 'finishing' ? 'Mark as Complete' :
                                     stage.key === 'packaging' ? 'Mark as Complete' : 'Next'} →
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}