// API Helper Functions for Star Tailors Management System

/**
 * Delete a workflow job and its associated bill
 * @param id - The workflow ID to delete
 * @returns Promise with the API response
 */
export async function deleteJob(id: string) {
  try {
    const response = await fetch(`/api/workflow/${id}`, { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete job');
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
}

/**
 * Delete a bill directly (using the existing billing API)
 * @param id - The bill ID to delete
 * @returns Promise with the API response
 */
export async function deleteBill(id: string) {
  try {
    const response = await fetch(`/api/billing/${id}`, { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete bill');
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting bill:', error);
    throw error;
  }
}

/**
 * Fetch all workflows
 * @returns Promise with workflows data
 */
export async function fetchWorkflows() {
  try {
    const response = await fetch('/api/workflow');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch workflows');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching workflows:', error);
    throw error;
  }
}

/**
 * Fetch admin statistics
 * @returns Promise with admin stats data
 */
export async function fetchAdminStats() {
  try {
    const response = await fetch('/api/admin');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch admin stats');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
}