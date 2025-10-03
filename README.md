# Star Tailors Management System

A comprehensive tailoring management system built with Next.js 14, TypeScript, TailwindCSS, and MongoDB.

## Features

### Landing Page
- Purple gradient theme matching the reference design
- Three main navigation buttons:
  - Go to Admin Dashboard
  - Open Billing System
  - Garment Workflow Management

### Billing System (`/billing`)
- Customer details form (name, phone, garment type, quantity, rate, advance, due date)
- Measurement fields (length, shoulder, sleeve, chest, waist, hips, front neck, back neck)
- Image upload for design references
- Drawing pad with pen thickness control and clear functionality
- Automatic calculation of subtotal, discount, and balance
- Bill preview and generation

### Billing List (`/billing/list`)
- Table view of all bills with search functionality
- Pagination support
- Status tracking and filtering
- Customer ID generation

### Workflow Management (`/workflow`)
- Kanban-style board with 5 stages:
  - Cutting (Red)
  - Stitching (Orange)
  - Finishing (Yellow)
  - Packaging (Blue)
  - Delivered (Green)
- Stage counters showing job counts
- Job cards with customer info, measurements, and design images
- Move jobs between stages functionality

### Admin Dashboard (`/admin`)
- Overview metrics:
  - Total customers
  - Active orders
  - Completed orders
  - Total revenue
- Workflow stage summary
- Recent bills table
- Navigation to all system modules

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: MongoDB with Mongoose
- **Deployment**: Ready for Vercel

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd star-tailors
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/star-tailor
   ```

4. **Database Setup**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Create a database named `star-tailor`
   - Collections `bills` and `workflow` will be created automatically

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## API Routes

### Billing API
- `POST /api/billing` - Create a new bill
- `GET /api/billing` - Fetch all bills (with pagination and search)
- `GET /api/billing/:id` - Fetch bill by ID
- `PUT /api/billing/:id` - Update bill

### Workflow API
- `POST /api/workflow` - Create workflow job
- `GET /api/workflow` - Fetch workflow jobs by stage
- `PUT /api/workflow/:id` - Update workflow stage/assignment

### Admin API
- `GET /api/admin` - Get system statistics

## Database Schema

### Bills Collection
```javascript
{
  customerName: String,
  phone: String,
  garmentType: String,
  quantity: Number,
  rate: Number,
  subtotal: Number,
  discount: Number,
  advance: Number,
  balance: Number,
  status: String, // 'pending', 'in-progress', 'completed', 'delivered'
  dueDate: Date,
  measurements: {
    length: Number,
    shoulder: Number,
    sleeve: Number,
    chest: Number,
    waist: Number,
    hips: Number,
    frontNeck: Number,
    backNeck: Number
  },
  images: [String],
  drawings: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Workflow Collection
```javascript
{
  billId: String,
  customerName: String,
  stage: String, // 'cutting', 'stitching', 'finishing', 'packaging', 'delivered'
  assignedTo: String,
  notes: String,
  images: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## Features Implemented

✅ Landing page with purple gradient theme
✅ Billing system with form and list view
✅ Workflow management with kanban board
✅ Admin dashboard with statistics
✅ Image upload and drawing pad functionality
✅ Responsive design
✅ Search and pagination
✅ Automatic workflow creation when bills are created
✅ Real-time stage tracking
✅ No authentication (open access as requested)

## Deployment

This application is ready for deployment on Vercel:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Support

For any issues or questions, please refer to the documentation or create an issue in the repository.