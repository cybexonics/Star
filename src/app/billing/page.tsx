'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function BillingPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    garmentType: '',
    quantity: 1,
    rate: 0,
    advance: 0,
    dueDate: '',
    tailorNotes: '',
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

  const subtotal = formData.quantity * formData.rate;
  const balance = subtotal - formData.advance;
  
  const generateBillNo = () => {
    return `ST${Date.now().toString().slice(-6)}`;
  };

  const generateQRCode = (balance: number, billNo: string) => {
    return `upi://pay?pa=raghukatti9912-1@okhdfcbank&pn=StarTailors&am=${balance}&cu=INR&tn=Order:${billNo}`;
  };

  const billNo = generateBillNo();
  const qrCodeData = generateQRCode(balance, billNo);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages(prev => [...prev, event.target!.result as string]);
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
      ctx.strokeStyle = '#000';
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
        billNo,
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      tailorNotes: '',
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
  };

  const handlePrint = () => {
    window.print();
  };

  if (showPreview) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="card mb-6 print:hidden">
            <div className="flex justify-between items-center">
              <h1 className="heading text-3xl">Bill Preview - {billNo}</h1>
              <div className="space-x-4">
                <button onClick={handlePrint} className="btn-primary">Print Bill</button>
                <button onClick={resetForm} className="btn-primary">New Bill</button>
                <Link href="/workflow" className="btn-primary inline-block">Go to Workflow</Link>
                <button onClick={() => setShowPreview(false)} className="bg-[#800F2F] text-white px-4 py-2 rounded-md hover:bg-[#590D22] transition-colors">Close</button>
              </div>
            </div>
          </div>

          {/* Invoice Layout */}
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg print:shadow-none print:border-0">
            {/* Header */}
            <div className="border-b-2 border-[#A4133C] p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-[#590D22]">STAR TAILORS</h1>
                  <p className="text-[#800F2F]">Craftsmanship Meets Precision</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-[#590D22]">Bill No: {billNo}</p>
                  <p className="text-[#800F2F]">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Main Content - Two Columns */}
            <div className="grid lg:grid-cols-2 gap-6 p-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Customer Details */}
                <div>
                  <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-3">Customer Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {formData.customerName}</p>
                    <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                    <p><span className="font-medium">Garment:</span> {formData.garmentType}</p>
                    <p><span className="font-medium">Due Date:</span> {new Date(formData.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Measurements */}
                <div>
                  <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-3">Measurements</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(formData.measurements).map(([key, value]) => 
                      value ? (
                        <p key={key}>
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {value}"
                        </p>
                      ) : null
                    )}
                  </div>
                </div>

                {/* Tailor Notes */}
                {formData.tailorNotes && (
                  <div>
                    <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-3">Tailor Notes</h3>
                    <p className="text-sm bg-yellow-50 p-3 rounded border">{formData.tailorNotes}</p>
                  </div>
                )}

                {/* Design Images */}
                {images.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-3">Design Images</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((image, index) => (
                        <img key={index} src={image} alt={`Design ${index + 1}`} className="w-full h-20 object-cover rounded border" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Bill Table */}
                <div>
                  <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-3">Bill Details</h3>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">Sr.No</th>
                        <th className="border border-gray-300 p-2 text-left">Description</th>
                        <th className="border border-gray-300 p-2 text-center">Qty</th>
                        <th className="border border-gray-300 p-2 text-right">Rate</th>
                        <th className="border border-gray-300 p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2">1</td>
                        <td className="border border-gray-300 p-2 capitalize">{formData.garmentType} Tailoring</td>
                        <td className="border border-gray-300 p-2 text-center">{formData.quantity}</td>
                        <td className="border border-gray-300 p-2 text-right">₹{formData.rate.toFixed(2)}</td>
                        <td className="border border-gray-300 p-2 text-right">₹{subtotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="border border-gray-300 rounded">
                  <div className="bg-gray-100 p-3 font-bold border-b border-gray-300">Payment Summary</div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Advance Paid:</span>
                      <span>₹{formData.advance.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Balance Due:</span>
                      <span>₹{balance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                {balance > 0 && (
                  <div className="text-center border border-gray-300 rounded p-4">
                    <h4 className="font-bold mb-2">Pay via UPI</h4>
                    <div className="bg-white p-2 inline-block border border-gray-300 rounded">
                      <QRCodeSVG 
                        value={qrCodeData} 
                        size={120} 
                        includeMargin={true}
                        className="mx-auto"
                      />
                    </div>
                    <p className="text-xs mt-2 text-gray-600">Scan to pay ₹{balance.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1 break-all">{qrCodeData}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 mt-6">
              <div className="text-center py-4 text-sm text-gray-600">
                Thank you for choosing Star Tailors!
              </div>
              
              {/* Cut Line */}
              <div className="border-t border-dashed border-gray-400 my-4"></div>
              
              {/* Tailor Copy */}
              <div className="bg-gray-50 p-4 border-b border-gray-300">
                <h4 className="font-bold text-center">--- TAILOR MANAGEMENT COPY ---</h4>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <p><strong>Customer:</strong> {formData.customerName}</p>
                    <p><strong>Phone:</strong> {formData.phone}</p>
                    <p><strong>Bill No:</strong> {billNo}</p>
                  </div>
                  <div>
                    <p><strong>Garment:</strong> {formData.garmentType}</p>
                    <p><strong>Due Date:</strong> {new Date(formData.dueDate).toLocaleDateString()}</p>
                    <p><strong>Balance:</strong> ₹{balance.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              {/* Customer Copy */}
              <div className="bg-blue-50 p-4">
                <h4 className="font-bold text-center">--- CUSTOMER COPY ---</h4>
                <div className="text-center mt-2 text-sm">
                  <p><strong>Bill No:</strong> {billNo} | <strong>Balance:</strong> ₹{balance.toFixed(2)}</p>
                  <p>Please keep this receipt for reference</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex justify-between items-center">
            <h1 className="heading text-3xl">Billing Department</h1>
            <div className="space-x-4">
              <Link href="/billing/list" className="btn-primary">View Recent Bills</Link>
              <Link href="/" className="btn-primary">Back to Home</Link>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="card">
            <h2 className="heading text-2xl mb-6">Customer Details</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label text-sm mb-2 block">Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="label text-sm mb-2 block">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="label text-sm mb-2 block">Garment Type *</label>
                <select
                  name="garmentType"
                  value={formData.garmentType}
                  onChange={handleInputChange}
                  required
                  className="input-field w-full"
                >
                  <option value="">Select Type</option>
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
                <label className="label text-sm mb-2 block">Due Date *</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="card">
            <h2 className="heading text-2xl mb-6">Pricing Details</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="label text-sm mb-2 block">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="label text-sm mb-2 block">Rate (₹) *</label>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="label text-sm mb-2 block">Advance (₹)</label>
                <input
                  type="number"
                  name="advance"
                  value={formData.advance}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="input-field w-full"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="label text-sm">Subtotal:</span>
                <div className="text-lg font-bold text-gray-900">₹{subtotal.toFixed(2)}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <span className="label text-sm">Advance:</span>
                <div className="text-lg font-bold text-gray-900">₹{formData.advance.toFixed(2)}</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-md">
                <span className="label text-sm">Balance:</span>
                <div className="text-xl font-bold text-gray-900">₹{balance.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className="card">
            <h2 className="heading text-2xl mb-6">Measurements</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(formData.measurements).map(([key, value]) => (
                <div key={key}>
                  <label className="label text-sm mb-2 block capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="number"
                    name={`measurements.${key}`}
                    value={value}
                    onChange={handleInputChange}
                    step="0.1"
                    placeholder="inches"
                    className="input-field w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tailor Notes */}
          <div className="card">
            <h2 className="heading text-2xl mb-6">Tailor Notes</h2>
            <textarea
              name="tailorNotes"
              value={formData.tailorNotes}
              onChange={handleInputChange}
              placeholder="Special instructions for the tailor..."
              rows={3}
              className="input-field w-full"
            />
          </div>

          {/* Design Images */}
          <div className="card">
            <h2 className="heading text-2xl mb-6">Design Images</h2>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-50 file:to-blue-50 file:text-gray-700 hover:file:bg-gradient-to-r hover:file:from-purple-100 hover:file:to-blue-100"
              />
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img src={image} alt={`Design ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                      <button
                        type="button"
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Drawing Pad */}
          <div className="card">
            <h2 className="heading text-2xl mb-6">Drawing Pad</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="label text-sm">Pen Thickness:</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={penThickness}
                  onChange={(e) => setPenThickness(parseInt(e.target.value))}
                  className="w-32"
                />
                <span className="label text-sm">{penThickness}px</span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
                >
                  Clear
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={420}
                height={140}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border border-gray-300 rounded-md cursor-crosshair w-full h-48"
                style={{ maxWidth: '100%', height: '140px' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-8 py-3 text-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Generate & Preview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}