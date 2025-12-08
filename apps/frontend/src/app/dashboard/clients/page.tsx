'use client';
import React from 'react';

const UserClients: React.FC = () => {
  const myAgents = [
    { 
      id: 1, 
      name: 'John Doe Realtor', 
      agency: 'Premium Real Estate',
      rating: 4.8,
      listings: 45,
      phone: '+254 712 345 678',
      email: 'john.doe@realty.com',
      avatar: 'JD',
      verified: true,
      status: 'Active'
    },
    { 
      id: 2, 
      name: 'Jane Smith Realty', 
      agency: 'Elite Properties',
      rating: 4.9,
      listings: 62,
      phone: '+254 723 456 789',
      email: 'jane.smith@elite.properties',
      avatar: 'JS',
      verified: true,
      status: 'Active'
    },
    { 
      id: 3, 
      name: 'Mike Johnson Properties', 
      agency: 'Dream Homes Ltd',
      rating: 4.7,
      listings: 38,
      phone: '+254 734 567 890',
      email: 'mike.johnson@dreamhomes.com',
      avatar: 'MJ',
      verified: true,
      status: 'Active'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Agents</h1>
        <p className="mt-2 text-gray-600">Manage your connections with real estate agents.</p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myAgents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{agent.avatar}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                    {agent.verified && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{agent.agency}</p>
                </div>
              </div>
            </div>

            {/* Rating and Listings */}
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-semibold text-gray-900">{agent.rating}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">{agent.listings} Listings</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{agent.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{agent.email}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Contact
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                View Listings
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserClients;
