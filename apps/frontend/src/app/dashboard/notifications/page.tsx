'use client';
import React, { useState } from 'react';

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');

  const mockNotifications = [
    { id: 1, message: 'New appointment confirmed for 123 Main St', time: '2 min ago', type: 'appointment', read: false },
    { id: 2, message: 'Your appointment request has been reviewed', time: '1 hour ago', type: 'appointment', read: false },
    { id: 3, message: 'New property matches your search criteria', time: '3 hours ago', type: 'property', read: true },
    { id: 4, message: 'Your saved listing has been updated', time: '1 day ago', type: 'property', read: true },
  ];

  const mockMessages = [
    { id: 1, from: 'John Doe Realtor', agent: 'Premium Agent', message: 'Hello! I saw you were interested in 123 Main St. Would you like to schedule a viewing?', time: '2 min ago', unread: true },
    { id: 2, from: 'Jane Smith Realty', agent: 'Verified Agent', message: 'Thank you for your interest in our listings. I have a few properties that might match what you\'re looking for.', time: '1 hour ago', unread: true },
    { id: 3, from: 'Mike Johnson Properties', agent: 'Platinum Agent', message: 'Are you still looking for a 2-bedroom apartment? I have some new listings.', time: '2 days ago', unread: false },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications & Messages</h1>
        <p className="mt-2 text-gray-600">Stay updated with your property activity and agent communications.</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Messages
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-y-0.5 bg-red-500 rounded-full">3</span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors ${
                    notification.read ? 'bg-white' : 'bg-blue-50'
                  } hover:bg-gray-50`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <span className="ml-4 w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors ${
                    msg.unread ? 'bg-blue-50' : 'bg-white'
                  } hover:bg-gray-50`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{msg.from}</h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          {msg.agent}
                        </span>
                        {msg.unread && (
                          <span className="inline-flex items-center justify-center w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{msg.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
