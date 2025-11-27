'use client';
import React, { useState } from 'react';

interface AppointmentFormProps {
  mode: 'user' | 'admin'; // user books appointment, admin manages
  realtorName?: string;
  propertyAddress?: string;
  onClose?: () => void;
  onSubmit?: (data: { clientName: string; email: string; phone: string; date: string; time: string; message?: string }) => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  mode, 
  realtorName = '', 
  propertyAddress = '',
  onClose,
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    propertyAddress: propertyAddress || '',
    realtorName: realtorName || '',
    date: '',
    time: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (mode === 'user') {
      if (!formData.propertyAddress.trim()) {
        newErrors.propertyAddress = 'Property address is required';
      }
      if (!formData.realtorName.trim()) {
        newErrors.realtorName = 'Realtor name is required';
      }
      if (!formData.date) {
        newErrors.date = 'Date is required';
      }
      if (!formData.time) {
        newErrors.time = 'Time is required';
      }
      if (!formData.clientName.trim()) {
        newErrors.clientName = 'Your name is required';
      }
      if (!formData.clientEmail.trim()) {
        newErrors.clientEmail = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
        newErrors.clientEmail = 'Invalid email format';
      }
      if (!formData.clientPhone.trim()) {
        newErrors.clientPhone = 'Phone number is required';
      }
    } else {
      // Admin mode - managing appointments
      if (!formData.clientName.trim()) {
        newErrors.clientName = 'Client name is required';
      }
      if (!formData.propertyAddress.trim()) {
        newErrors.propertyAddress = 'Property address is required';
      }
      if (!formData.date) {
        newErrors.date = 'Date is required';
      }
      if (!formData.time) {
        newErrors.time = 'Time is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const appointmentData = {
      ...formData,
      id: Date.now(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    if (onSubmit) {
      onSubmit(appointmentData);
    }

    // Reset form
    setFormData({
      propertyAddress: propertyAddress || '',
      realtorName: realtorName || '',
      date: '',
      time: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      notes: '',
    });

    if (onClose) {
      onClose();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {mode === 'user' ? 'Book Appointment' : 'Schedule Appointment'}
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {mode === 'user' 
            ? 'Fill in the details below to schedule a property viewing appointment.'
            : 'Schedule a new appointment with a client.'}
        </p>
      </div>

      {/* Property Address */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Property Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.propertyAddress}
          onChange={(e) => handleChange('propertyAddress', e.target.value)}
          placeholder="e.g., 123 Main St, Nairobi"
          className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.propertyAddress ? 'border-red-500' : 'border-gray-300'
          }`}
          readOnly={mode === 'user' && !!propertyAddress}
        />
        {errors.propertyAddress && (
          <p className="text-red-500 text-xs mt-1">{errors.propertyAddress}</p>
        )}
      </div>

      {/* Realtor Name (for users) */}
      {mode === 'user' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Realtor Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.realtorName}
            onChange={(e) => handleChange('realtorName', e.target.value)}
            placeholder="e.g., John Doe Realtor"
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.realtorName ? 'border-red-500' : 'border-gray-300'
            }`}
            readOnly={!!realtorName}
          />
          {errors.realtorName && (
            <p className="text-red-500 text-xs mt-1">{errors.realtorName}</p>
          )}
        </div>
      )}

      {/* Client Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {mode === 'user' ? 'Your Name' : 'Client Name'} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.clientName}
          onChange={(e) => handleChange('clientName', e.target.value)}
          placeholder={mode === 'user' ? "Enter your full name" : "Enter client's name"}
          className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.clientName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.clientName && (
          <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>
        )}
      </div>

      {/* Client Email (for users) */}
      {mode === 'user' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.clientEmail}
            onChange={(e) => handleChange('clientEmail', e.target.value)}
            placeholder="your.email@example.com"
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.clientEmail ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.clientEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.clientEmail}</p>
          )}
        </div>
      )}

      {/* Client Phone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {mode === 'user' ? 'Phone Number' : 'Client Phone'} <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={formData.clientPhone}
          onChange={(e) => handleChange('clientPhone', e.target.value)}
          placeholder="+254 712 345 678"
          className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.clientPhone ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.clientPhone && (
          <p className="text-red-500 text-xs mt-1">{errors.clientPhone}</p>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.date && (
            <p className="text-red-500 text-xs mt-1">{errors.date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Time <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.time}
            onChange={(e) => handleChange('time', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
              errors.time ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {errors.time && (
            <p className="text-red-500 text-xs mt-1">{errors.time}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any special requirements or questions..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          {mode === 'user' ? 'Book Appointment' : 'Schedule Appointment'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AppointmentForm;

