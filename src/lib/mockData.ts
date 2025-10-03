// Mock data store for development/testing when MongoDB is not available
export interface MockBill {
  _id: string;
  customerName: string;
  phone: string;
  garmentType: string;
  quantity: number;
  rate: number;
  subtotal: number;
  advance: number;
  balance: number;
  status: 'pending' | 'in-progress' | 'completed' | 'delivered';
  dueDate: Date;
  measurements: {
    length?: number;
    shoulder?: number;
    sleeve?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    frontNeck?: number;
    backNeck?: number;
  };
  images?: string[];
  drawings?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MockWorkflow {
  _id: string;
  billId: string;
  customerName: string;
  stage: 'cutting' | 'stitching' | 'finishing' | 'packaging' | 'delivered';
  assignedTo?: string;
  notes?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

class MockDataStore {
  private bills: MockBill[] = [];
  private workflows: MockWorkflow[] = [];
  private billCounter = 1;
  private workflowCounter = 1;

  // Initialize with some sample data
  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample bills
    const sampleBills: MockBill[] = [
      {
        _id: '1',
        customerName: 'John Doe',
        phone: '+91 9876543210',
        garmentType: 'shirt',
        quantity: 2,
        rate: 800,
        subtotal: 1600,
        advance: 500,
        balance: 1100,
        status: 'pending',
        dueDate: new Date('2024-01-15'),
        measurements: {
          length: 30,
          shoulder: 18,
          sleeve: 24,
          chest: 40
        },
        images: [],
        drawings: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        _id: '2',
        customerName: 'Jane Smith',
        phone: '+91 8765432109',
        garmentType: 'dress',
        quantity: 1,
        rate: 1200,
        subtotal: 1200,
        advance: 600,
        balance: 600,
        status: 'in-progress',
        dueDate: new Date('2024-01-20'),
        measurements: {
          length: 42,
          chest: 36,
          waist: 28,
          hips: 38
        },
        images: [],
        drawings: [],
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
      }
    ];

    // Sample workflows
    const sampleWorkflows: MockWorkflow[] = [
      {
        _id: '1',
        billId: '1',
        customerName: 'John Doe',
        stage: 'cutting',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        _id: '2',
        billId: '2',
        customerName: 'Jane Smith',
        stage: 'stitching',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
      }
    ];

    this.bills = sampleBills;
    this.workflows = sampleWorkflows;
    this.billCounter = 3;
    this.workflowCounter = 3;
  }

  // Bill operations
  createBill(billData: Omit<MockBill, '_id' | 'createdAt' | 'updatedAt'>): MockBill {
    const bill: MockBill = {
      ...billData,
      _id: this.billCounter.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bills.push(bill);
    this.billCounter++;
    return bill;
  }

  getBills(query: any = {}, options: any = {}): MockBill[] {
    let filteredBills = [...this.bills];

    // Apply search filter
    if (query.$or) {
      const searchTerms = query.$or;
      filteredBills = filteredBills.filter(bill => 
        searchTerms.some((term: any) => {
          if (term.customerName) {
            return bill.customerName.toLowerCase().includes(term.customerName.$regex.toLowerCase());
          }
          if (term.phone) {
            return bill.phone.includes(term.phone.$regex);
          }
          return false;
        })
      );
    }

    // Apply status filter
    if (query.status) {
      if (query.status.$in) {
        filteredBills = filteredBills.filter(bill => query.status.$in.includes(bill.status));
      } else if (query.status.$nin) {
        filteredBills = filteredBills.filter(bill => !query.status.$nin.includes(bill.status));
      }
    }

    // Sort by createdAt descending
    filteredBills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    if (options.skip || options.limit) {
      const skip = options.skip || 0;
      const limit = options.limit || filteredBills.length;
      filteredBills = filteredBills.slice(skip, skip + limit);
    }

    return filteredBills;
  }

  countBills(query: any = {}): number {
    return this.getBills(query).length;
  }

  getBillById(id: string): MockBill | null {
    return this.bills.find(bill => bill._id === id) || null;
  }

  // Workflow operations
  createWorkflow(workflowData: Omit<MockWorkflow, '_id' | 'createdAt' | 'updatedAt'>): MockWorkflow {
    const workflow: MockWorkflow = {
      ...workflowData,
      _id: this.workflowCounter.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.workflows.push(workflow);
    this.workflowCounter++;
    return workflow;
  }

  getWorkflows(query: any = {}): MockWorkflow[] {
    let filteredWorkflows = [...this.workflows];

    if (query.stage) {
      filteredWorkflows = filteredWorkflows.filter(workflow => workflow.stage === query.stage);
    }

    // Sort by updatedAt descending
    filteredWorkflows.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return filteredWorkflows;
  }

  getWorkflowById(id: string): MockWorkflow | null {
    return this.workflows.find(workflow => workflow._id === id) || null;
  }

  updateWorkflow(id: string, updateData: Partial<MockWorkflow>): MockWorkflow | null {
    const workflowIndex = this.workflows.findIndex(workflow => workflow._id === id);
    if (workflowIndex === -1) return null;

    this.workflows[workflowIndex] = {
      ...this.workflows[workflowIndex],
      ...updateData,
      updatedAt: new Date()
    };

    return this.workflows[workflowIndex];
  }

  deleteWorkflow(id: string): boolean {
    const workflowIndex = this.workflows.findIndex(workflow => workflow._id === id);
    if (workflowIndex === -1) return false;

    // Get the workflow to find associated bill
    const workflow = this.workflows[workflowIndex];
    
    // Remove the workflow
    this.workflows.splice(workflowIndex, 1);
    
    // Remove associated bill if exists
    if (workflow.billId) {
      const billIndex = this.bills.findIndex(bill => bill._id === workflow.billId);
      if (billIndex !== -1) {
        this.bills.splice(billIndex, 1);
      }
    }
    
    return true;
  }

  // Stats operations
  getAdminStats() {
    const totalCustomers = new Set(this.bills.map(bill => bill.customerName)).size;
    const activeOrders = this.bills.filter(bill => !['completed', 'delivered'].includes(bill.status)).length;
    const completedOrders = this.bills.filter(bill => ['completed', 'delivered'].includes(bill.status)).length;
    const revenue = this.bills.reduce((sum, bill) => sum + bill.subtotal, 0);

    const workflowStages = this.workflows.reduce((acc, workflow) => {
      acc[workflow.stage] = (acc[workflow.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentBills = this.getBills({}, { limit: 5 });

    return {
      totalCustomers,
      activeOrders,
      completedOrders,
      revenue,
      recentBills,
      workflowStages
    };
  }
}

// Export singleton instance
export const mockDataStore = new MockDataStore();