export interface Bill {
  _id?: string;
  billNo?: string;
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
  tailorNotes?: string;
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
  updatedAt?: Date;
}

export interface WorkflowJob {
  _id?: string;
  billId: string;
  customerName: string;
  stage: 'cutting' | 'stitching' | 'finishing' | 'packaging' | 'delivered';
  assignedTo?: string;
  notes?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminStats {
  totalCustomers: number;
  activeOrders: number;
  completedOrders: number;
  revenue: number;
}