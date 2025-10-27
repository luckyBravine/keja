'use client';
import React, { useState } from 'react';

const UserAppointments: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('18');

  const myAppointments = [
    { id: 1, agent: 'John Doe Realtor', property: '123 Main St, Nairobi', date: 'Oct 15, 2024', time: '10:00 AM', status: 'Confirmed' },
    { id: 2, agent: 'Jane Smith Realty', property: '456 Oak Ave, Mombasa', date: 'Oct 20, 2024', time: '02:30 PM', status: 'Pending' },
    { id: 3, agent: 'Mike Johnson Properties', property: '789 Pine Rd, Kisumu', date: 'Oct 25, 2024', time: '11:00 AM', status: 'Confirmed' }
  ];

  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="mt-2 text-gray-600">View and manage your scheduled property viewings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📅</span>
              <h2 className="text-xl font-semibold text-gray-900">October 2024</h2>
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
                <span className="text-gray-600">Selected Date</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Appointment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - My Appointments */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl">📋</span>
              <h2 className="text-lg font-semibold text-gray-900">Scheduled Viewings</h2>
            </div>
            
            <div className="space-y-4">
              {myAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{appointment.agent}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'Confirmed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{appointment.property}</p>
                    <p className="text-xs text-gray-500">{appointment.date} at {appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Schedule New Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAppointments;
