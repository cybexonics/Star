import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  billNo: { type: String, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  garmentType: { type: String, required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  advance: { type: Number, default: 0 },
  balance: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'delivered'],
    default: 'pending'
  },
  dueDate: { type: Date, required: true },
  tailorNotes: { type: String },
  measurements: {
    length: Number,
    shoulder: Number,
    sleeve: Number,
    chest: Number,
    waist: Number,
    hips: Number,
    frontNeck: Number,
    backNeck: Number,
  },
  images: [String],
  drawings: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const workflowSchema = new mongoose.Schema({
  billId: { type: String, required: true },
  customerName: { type: String, required: true },
  stage: { 
    type: String, 
    enum: ['cutting', 'stitching', 'finishing', 'packaging', 'delivered'],
    default: 'cutting'
  },
  assignedTo: String,
  notes: String,
  images: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Bill = mongoose.models.Bill || mongoose.model('Bill', billSchema);
export const Workflow = mongoose.models.Workflow || mongoose.model('Workflow', workflowSchema);