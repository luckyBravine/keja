'use client';
import React, { useState } from 'react';

const AdminSubscription: React.FC = () => {
  const [expandedPayment, setExpandedPayment] = useState(0);

  const paymentHistory = [
    {
      id: 1,
      date: '2023-12-01',
      description: 'Monthly Premium Subscription',
      amount: '$99.99',
      status: 'Paid',
      expanded: expandedPayment === 1
    },
    {
      id: 2,
      date: '2023-11-01',
      description: 'Monthly Premium Subscription',
      amount: '$99.99',
      status: 'Paid',
      expanded: expandedPayment === 2
    },
    {
      id: 3,
      date: '2023-10-01',
      description: 'Monthly Premium Subscription',
      amount: '$99.99',
      status: 'Paid',
      expanded: expandedPayment === 3
    }
  ];

  const togglePaymentExpansion = (id: number) => {
    setExpandedPayment(expandedPayment === id ? 0 : id);
  };

  return (
    <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Manager</h1>
          <p className="mt-2 text-gray-600">Manage your subscription plan and view payment history.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">✓</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Current Plan: Premium</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Enjoy unlimited listings, advanced analytics, and priority support.
              </p>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Next billing:</p>
                <p className="text-lg font-semibold text-blue-600">January 15, 2024</p>
              </div>
              
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Manage Subscription
              </button>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl">📄</span>
              <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
            </div>
            
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => togglePaymentExpansion(payment.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{payment.description}</p>
                      <p className="text-sm text-gray-500">{payment.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{payment.amount}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                      <span className="text-gray-400">
                        {payment.expanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>
                  
                  {payment.expanded && (
                    <div className="px-4 pb-4 border-t border-gray-200">
                      <div className="pt-4">
                        <p className="text-sm text-gray-600 mb-2">Amount: <span className="font-semibold text-gray-900">{payment.amount}</span></p>
                        <p className="text-sm text-gray-600 mb-2">Payment Method: <span className="font-semibold text-gray-900">Credit Card ending in 4242</span></p>
                        <p className="text-sm text-gray-600">Transaction ID: <span className="font-semibold text-gray-900">txn_1234567890</span></p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Premium Plan Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl">🏠</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Unlimited Listings</h3>
              <p className="text-sm text-gray-600">Post as many properties as you want without restrictions.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-sm text-gray-600">Track views, leads, and performance metrics for all your listings.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Priority Support</h3>
              <p className="text-sm text-gray-600">Get faster response times and dedicated support for your business.</p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AdminSubscription;
