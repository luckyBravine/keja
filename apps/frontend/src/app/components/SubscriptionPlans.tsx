'use client';
import React, { useState, useEffect } from 'react';
import PaystackButton from './PaystackButton';

interface SubscriptionPlan {
  id: number;
  name: string;
  plan_type: string;
  target_user_type?: string;
  price: string;
  currency: string;
  description: string;
  features: string[];
  max_listings: number | null;
  is_active: boolean;
}

interface SubscriptionPlansProps {
  apiUrl?: string;
  token?: string;
  publicKey?: string;
  userEmail?: string;
  targetUserType?: 'agent' | 'client'; // Filter plans by user type
  onPaymentSuccess?: () => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  apiUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
    : 'http://localhost:8000/api',
  token,
  publicKey = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    : 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  userEmail = '',
  targetUserType,
  onPaymentSuccess,
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, [targetUserType]);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Build URL with query parameter if targetUserType is provided
      let plansUrl = `${apiUrl}/payments/plans/`;
      if (targetUserType) {
        plansUrl += `?target_user_type=${targetUserType}`;
      }

      const response = await fetch(plansUrl, {
        method: 'GET',
        headers,
        mode: 'cors',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch subscription plans: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const plansData = data.results || data;
      
      if (Array.isArray(plansData)) {
        setPlans(plansData);
      } else {
        setPlans([]);
      }
    } catch (err: any) {
      console.error('Fetch plans error:', err);
      setError(err.message || 'Failed to load subscription plans. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-red-600 text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-red-800 font-semibold mb-1">Failed to load plans</p>
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <div className="bg-red-100 p-3 rounded-lg mb-3">
              <p className="text-red-800 text-xs font-medium mb-1">Troubleshooting:</p>
              <ul className="text-red-700 text-xs list-disc list-inside space-y-1">
                <li>Make sure the backend server is running on {apiUrl}</li>
                <li>Check if subscription plans exist in Django admin</li>
                <li>Verify CORS settings allow requests from this origin</li>
                <li>Check browser console (F12) for detailed error messages</li>
              </ul>
            </div>
            <button
              onClick={fetchPlans}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <span className="text-yellow-600 text-4xl mb-4 block">📋</span>
        <p className="text-yellow-800 font-semibold mb-2">No subscription plans available</p>
        <p className="text-yellow-600 text-sm">
          Please contact the administrator to set up subscription plans.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-sm">Select a plan to get started with premium features:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`bg-white rounded-xl shadow-sm border-2 p-6 flex flex-col h-full ${
            selectedPlan?.id === plan.id ? 'border-blue-600' : 'border-gray-200'
          }`}
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-blue-600">{plan.currency}</span>
              <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-600">/month</span>
            </div>
            <p className="text-gray-600 text-sm">{plan.description}</p>
          </div>

          <ul className="space-y-3 mb-6 flex-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700 text-sm">{feature}</span>
              </li>
            ))}
            {plan.max_listings !== null && (
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700 text-sm">
                  Up to {plan.max_listings} listings
                </span>
              </li>
            )}
            {plan.max_listings === null && (
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700 text-sm">Unlimited listings</span>
              </li>
            )}
          </ul>

          <div className="mt-auto pt-4">
          <PaystackButton
            email={userEmail}
            amount={parseFloat(plan.price) * 100} // Convert to smallest currency unit
            currency={plan.currency}
            planId={plan.id}
            planName={plan.name}
            publicKey={publicKey}
            apiUrl={apiUrl}
            token={token}
            onSuccess={() => {
              if (onPaymentSuccess) {
                onPaymentSuccess();
              }
            }}
          />
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;

