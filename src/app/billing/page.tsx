'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function BillingPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    garmentType: '',
    quantity: 1,
    rate: 0,
    advance: 0,
    dueDate: '',
    measurements: {
      length: '',
      shoulder: '',
      sleeve: '',
      chest: '',
      waist: '',
      hips: '',
      frontNeck: '',
      backNeck: ''
    }
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [penThickness, setPenThickness] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upi, setUpi] = useState<string>('');
  const [billNo, setBillNo] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subtotal = formData.quantity * formData.rate;
  const balance = subtotal - formData.advance;

  const generateBillNo = () => {
    return `ST${Date.now().toString().slice(-6)}`;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/upi');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.upi) setUpi(data.upi);
      } catch (err) {
        // fallback
      }
    })();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('measurements.')) {
      const measurementField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [measurementField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'quantity' || name === 'rate' || name === 'advance'
          ? parseFloat(value) || 0
          : value
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages(prev => [...prev, event.target?.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = penThickness;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#6a24e6';
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newBillNo = generateBillNo();
    setBillNo(newBillNo);

    try {
      let drawings: string[] = [];
      const canvas = canvasRef.current;
      if (canvas) {
        const dataURL = canvas.toDataURL();
        if (dataURL !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==') {
          drawings.push(dataURL);
        }
      }

      const billData = {
        ...formData,
        billNo: newBillNo,
        measurements: Object.fromEntries(
          Object.entries(formData.measurements).map(([key, value]) => [
            key,
            value ? parseFloat(value) : undefined
          ])
        ),
        images,
        drawings,
        dueDate: new Date(formData.dueDate)
      };

      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData),
      });

      const result = await response.json();
      if (result.success) {
        setShowPreview(true);
      } else {
        alert('Error creating bill: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      phone: '',
      garmentType: '',
      quantity: 1,
      rate: 0,
      advance: 0,
      dueDate: '',
      measurements: {
        length: '',
        shoulder: '',
        sleeve: '',
        chest: '',
        waist: '',
        hips: '',
        frontNeck: '',
        backNeck: ''
      }
    });
    setImages([]);
    clearCanvas();
    setShowPreview(false);
    setBillNo('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-surface-100 p-4 md:p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-brand-600">Billing Preview</h1>
            <div className="flex gap-3">
              <button 
                onClick={() => window.print()} 
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Print Bill
              </button>
              <button 
                onClick={resetForm} 
                className="px-4 py-2 border-2 border-brand-300 text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
              >
                New Bill
              </button>
              <Link 
                href="/workflow" 
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Go to Workflow
              </Link>
            </div>
          </div>
          
          <div className="rounded-lg p-6 border-2 border-gray-100 break-inside-avoid">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-brand-600">STAR TAILORS</h2>
              <p className="text-gray-600">Business Management System</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg text-brand-600 border-b-2 border-gray-100 pb-3 mb-4">Customer Details</h3>
                <div className="space-y-3">
                  <p><span className="font-semibold text-gray-800">Name:</span> {formData.customerName}</p>
                  <p><span className="font-semibold text-gray-800">Phone:</span> {formData.phone}</p>
                  <p><span className="font-semibold text-gray-800">Garment:</span> {formData.garmentType}</p>
                  <p><span className="font-semibold text-gray-800">Due Date:</span> {formData.dueDate}</p>
                </div>
                
                <h3 className="font-bold text-lg text-brand-600 border-b-2 border-gray-100 pb-3 mt-8 mb-4">Measurements (inches)</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(formData.measurements).map(([key, value]) => (
                    <p key={key} className="text-sm">
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {value}
                    </p>
                  ))}
                </div>
                
                {/* Design Images Section */}
                {images.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold text-lg text-brand-600 border-b-2 border-gray-100 pb-3 mb-4">Design Images</h3>
                    <div className="flex flex-wrap gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="border-2 border-gray-200 rounded-lg p-2">
                          <img 
                            src={image} 
                            alt={`Design ${index + 1}`} 
                            className="w-32 h-32 object-contain rounded border border-gray-100 print:w-24 print:h-24"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-brand-600 border-b-2 border-gray-100 pb-3 mb-4">Bill Details</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-soft">
                      <th className="border-2 border-gray-100 p-3 text-left font-semibold">Description</th>
                      <th className="border-2 border-gray-100 p-3 text-center font-semibold">Qty</th>
                      <th className="border-2 border-gray-100 p-3 text-right font-semibold">Rate</th>
                      <th className="border-2 border-gray-100 p-3 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-2 border-gray-100 p-3">{formData.garmentType} Tailoring</td>
                      <td className="border-2 border-gray-100 p-3 text-center">{formData.quantity}</td>
                      <td className="border-2 border-gray-100 p-3 text-right">₹{formData.rate.toFixed(2)}</td>
                      <td className="border-2 border-gray-100 p-3 text-right">₹{subtotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Advance Paid:</span>
                    <span>₹{formData.advance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t-2 border-gray-100 pt-3">
                    <span>Balance Due:</span>
                    <span className="text-brand-600">₹{balance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b-2 border-gray-100 gap-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin" 
                className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back</span>
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/admin" className="text-brand-600 hover:text-brand-700 font-medium transition-colors">
                Admin Dashboard
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-brand-600 text-center">Billing System</h1>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 border-2 border-brand-300 text-brand-600 rounded-lg hover:bg-brand-50 font-medium transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                form="billingForm"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-medium transition-all"
              >
                Generate & Preview
              </button>
            </div>
          </div>

          <form id="billingForm" onSubmit={handleSubmit}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-brand-600">Billing Department</h2>
            </div>
            
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-semibold text-gray-800 mb-2">
                    Customer Name *
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="Customer Name"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="Phone Number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label htmlFor="garmentType" className="block text-sm font-semibold text-gray-800 mb-2">
                    Select Type *
                  </label>
                  <select
                    id="garmentType"
                    name="garmentType"
                    value={formData.garmentType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select type</option>
                    <option value="shirt">Shirt</option>
                    <option value="pant">Pant</option>
                    <option value="suit">Suit</option>
                    <option value="dress">Dress</option>
                    <option value="kurta">Kurta</option>
                    <option value="blouse">Blouse</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-semibold text-gray-800 mb-2">
                    Qty
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="rate" className="block text-sm font-semibold text-gray-800 mb-2">
                    Rate *
                  </label>
                  <input
                    id="rate"
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="advance" className="block text-sm font-semibold text-gray-800 mb-2">
                    Advance
                  </label>
                  <input
                    id="advance"
                    type="number"
                    name="advance"
                    value={formData.advance}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-800 mb-2">
                    Due Date
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-brand-600 mb-4">Measurements (inches)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['length', 'shoulder', 'sleeve', 'chest', 'waist', 'hips', 'frontNeck', 'backNeck'].map(field => (
                  <div key={field}>
                    <label htmlFor={`measurement-${field}`} className="block text-sm font-semibold text-gray-800 mb-2">
                      {field.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    </label>
                    <input
                      id={`measurement-${field}`}
                      type="number"
                      name={`measurements.${field}`}
                      value={formData.measurements[field as keyof typeof formData.measurements]}
                      onChange={handleInputChange}
                      step="0.1"
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      placeholder={field}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Images + Drawing Section - Two Column Layout */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT: Images Section */}
              <div>
                <h3 className="text-lg font-bold text-brand-600 mb-4">Images</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center h-full flex flex-col justify-center bg-white">
                  <input
                    ref={fileInputRef}
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="imageUpload" className="cursor-pointer block">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <button
                        type="button"
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg text-sm hover:shadow-lg transition-all"
                      >
                        Choose Files
                      </button>
                      <p className="text-gray-500 text-xs">Drop or click to browse</p>
                    </div>
                  </label>
                  
                  {/* Image previews */}
                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={image} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Drawing Section */}
              <div>
                <h3 className="text-lg font-bold text-brand-600 mb-4">Drawing</h3>
                <div className="flex flex-col h-full">
                  {/* Drawing Tools - Horizontal */}
                  <div className="flex gap-2 p-3 rounded-lg mb-3 bg-surface-soft">
                    <button
                      type="button"
                      className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded text-xs font-medium hover:shadow-md transition-all"
                    >
                      Pen
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 bg-gray-200 text-gray-800 rounded text-xs font-medium hover:bg-gray-300 transition-colors"
                    >
                      Eraser
                    </button>
                    <div className="w-6 h-6 bg-brand-600 rounded border border-gray-300 cursor-pointer"></div>
                    <select
                      value={penThickness}
                      onChange={(e) => setPenThickness(parseInt(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="1">1px</option>
                      <option value="2">2px</option>
                      <option value="3">3px</option>
                      <option value="4">4px</option>
                      <option value="5">5px</option>
                    </select>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="px-3 py-2 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors ml-auto"
                    >
                      Clear
                    </button>
                  </div>
                  
                  {/* Drawing Canvas */}
                  <div className="flex-1 border-2 border-gray-300 rounded-lg p-2 bg-white">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={300}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="border border-gray-300 rounded cursor-crosshair w-full h-full bg-white"
                      aria-label="Drawing pad for garment designs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-medium transition-all"
              >
                {isSubmitting ? 'Generating...' : 'Generate & Preview'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}