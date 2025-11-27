'use client';
import React, { useState } from 'react';
import AppointmentForm from '@/app/components/AppointmentForm';

const AdminAppointments: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('18');
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([
    { id: 1, client: 'Alice Johnson', property: '123 Ocean View Dr', date: '2024-01-10', time: '10:00 AM' },
    { id: 2, client: 'Bob Williams', property: '789 Elm Street', date: '2024-01-11', time: '02:30 PM' }
  ]);

  const availableSlots = {
    'Mon': ['09:00 AM', '11:00 AM', '02:00 PM'],
    'Tue': ['10:00 AM', '01:00 PM'],
    'Wed': ['09:30 AM', '03:00 PM'],
    'Thu': ['11:00 AM', '04:00 PM'],
    'Fri': ['09:00 AM', '10:30 AM', '02:00 PM']
  };

  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleAddTimeSlot = () => {
    if (newTimeSlot.trim()) {
      console.log('Adding time slot:', newTimeSlot);
      setNewTimeSlot('');
    }
  };

  const handleAppointmentSubmit = (appointmentData: { 
    clientName: string; 
    clientEmail: string; 
    clientPhone: string; 
    propertyAddress: string;
    realtorName: string;
    date: string; 
    time: string; 
    notes?: string;
    [key: string]: unknown;
  }) => {
    const newAppointment = {
      id: Date.now(),
      client: appointmentData.clientName,
      property: appointmentData.propertyAddress,
      date: appointmentData.date,
      time: appointmentData.time
    };
    setUpcomingAppointments([...upcomingAppointments, newAppointment]);
    setShowForm(false);
  };

  return (
    <>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments Management</h1>
            <p className="mt-2 text-gray-600">Manage your property viewing appointments and available time slots.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Schedule New Appointment
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📅</span>
                <h2 className="text-xl font-semibold text-gray-900">October 2025</h2>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day.toString())}
                    className={`p-2 text-sm rounded-lg transition-colors ${
                      selectedDate === day.toString()
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-800 rounded-full"></div>
                  <span className="text-gray-600">Booked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xl">📋</span>
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              </div>
              
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {upcomingAppointments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming appointments.</p>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{appointment.client}</p>
                          <p className="text-sm text-gray-600">{appointment.property}</p>
                          <p className="text-xs text-gray-500">{appointment.date}, {appointment.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Available Time Slots */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xl">⏰</span>
                <h2 className="text-lg font-semibold text-gray-900">Set Available Time Slots</h2>
              </div>
              
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {Object.entries(availableSlots).map(([day, slots]) => (
                  <div key={day}>
                    <p className="text-sm font-medium text-gray-700 mb-2">{day}</p>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Time Slot */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    placeholder="e.g., Mon, 09:00 AM"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddTimeSlot}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AppointmentForm
                mode="admin"
                onSubmit={handleAppointmentSubmit}
                onClose={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAppointments;
