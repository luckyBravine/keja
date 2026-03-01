'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SubscriptionPlans from '@/app/components/SubscriptionPlans';

interface Payment {
  id: number;
  date: string;
  description: string;
  amount: string;
  currency: string;
  status: string;
  transaction_id?: string;
  expanded: boolean;
}

interface Subscription {
  id: number;
  plan: {
    name: string;
    description: string;
  };
  status: string;
  start_date: string;
  next_billing_date: string | null;
  is_active: boolean;
}

const UserSubscription: React.FC = () => {
  const [expandedPayment, setExpandedPayment] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlans, setShowPlans] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const searchParams = useSearchParams();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  useEffect(() => {
    // Check for payment success in URL
    const paymentStatus = searchParams?.get('payment');
    if (paymentStatus === 'success') {
      // Verify payment and refresh data
      verifyPayment();
    }

    // Get auth token from localStorage
    const token = localStorage.getItem('accessToken');

    if (token) {
      fetchUserEmail(token);
      fetchSubscriptionData(token);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async () => {
    const reference = searchParams?.get('reference');
    if (!reference) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/payments/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reference }),
      });

      if (response.ok) {
        // Refresh subscription data
        fetchSubscriptionData(token);
        // Remove query params
        window.history.replaceState({}, '', '/dashboard/subscription');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
    }
  };

  const fetchUserEmail = async (token: string) => {
    try {
      const response = await fetch(`${apiUrl}/auth/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserEmail(userData.email || '');
      }
    } catch (error) {
      console.error('Failed to fetch user email:', error);
    }
  };

  const fetchSubscriptionData = async (token: string) => {
    try {
      // Fetch current subscription
      const subResponse = await fetch(`${apiUrl}/payments/subscriptions/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (subResponse.ok) {
        const subData = await subResponse.json();
        if (subData.results && subData.results.length > 0) {
          setSubscription(subData.results[0]);
          setShowPlans(false); // Don't show plans if subscription exists
        } else if (subData.length > 0) {
          setSubscription(subData[0]);
          setShowPlans(false);
        } else {
          // No subscription found, show plans by default
          setShowPlans(true);
        }
      } else {
        // If API fails, show plans anyway
        setShowPlans(true);
      }

      // Fetch payment history
      const paymentsResponse = await fetch(`${apiUrl}/payments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        const paymentList = paymentsData.results || paymentsData;
        setPayments(
          paymentList.map((p: any) => ({
            id: p.id,
            date: new Date(p.created_at).toLocaleDateString(),
            description: p.description || `Payment for ${p.plan?.name || 'Subscription'}`,
            amount: `${p.currency} ${parseFloat(p.amount).toLocaleString()}`,
            currency: p.currency,
            status: p.status === 'success' ? 'Paid' : p.status.charAt(0).toUpperCase() + p.status.slice(1),
            transaction_id: p.transaction_id || p.paystack_reference,
            expanded: expandedPayment === p.id,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePaymentExpansion = (id: number) => {
    setExpandedPayment(expandedPayment === id ? 0 : id);
    setPayments(
      payments.map((p) => ({
        ...p,
        expanded: expandedPayment === id ? false : p.id === id,
      }))
    );
  };

  const handlePaymentSuccess = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchSubscriptionData(token);
      setShowPlans(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Subscription</h1>
          <p className="mt-2 text-gray-600">Manage your subscription plan and view payment history.</p>
        </div>
        {!showPlans && subscription && (
          <button
            onClick={() => setShowPlans(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Change Plan
          </button>
        )}
      </div>

      {!showPlans ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                subscription?.is_active ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <span className={`text-lg ${subscription?.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                  {subscription?.is_active ? '✓' : '○'}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Current Plan: {subscription?.plan?.name || 'No Active Plan'}
              </h2>
            </div>
            
            <div className="space-y-4">
              {subscription ? (
                <>
                  <p className="text-gray-600">
                    {subscription.plan.description || 'Enjoy premium features and priority support.'}
                  </p>
                  
                  {subscription.next_billing_date && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Next billing:</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {new Date(subscription.next_billing_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setShowPlans(true)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    {subscription.is_active ? 'Change Plan' : 'Subscribe Now'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-600">
                    You don't have an active subscription. Choose a plan to get started.
                  </p>
                  <button 
                    onClick={() => setShowPlans(true)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    View Plans
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl">📄</span>
              <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
            </div>
            
            <div className="space-y-3">
              {payments.length > 0 ? (
                payments.map((payment) => (
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
                        <p className="text-sm text-gray-600 mb-2">Payment Method: <span className="font-semibold text-gray-900">Paystack</span></p>
                        {payment.transaction_id && (
                          <p className="text-sm text-gray-600">Transaction ID: <span className="font-semibold text-gray-900">{payment.transaction_id}</span></p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No payment history available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Choose a Subscription Plan</h2>
              <p className="text-gray-600 text-sm mt-1">Select the plan that best fits your needs</p>
            </div>
            {subscription && (
              <button
                onClick={() => setShowPlans(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                ← Back to Dashboard
              </button>
            )}
          </div>
          <SubscriptionPlans
            apiUrl={apiUrl}
            token={localStorage.getItem('accessToken') || undefined}
            publicKey={paystackPublicKey}
            userEmail={userEmail}
            targetUserType="client"
            onPaymentSuccess={handlePaymentSuccess}
          />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>💡 Note:</strong> After payment, you'll be redirected back to complete your subscription setup.
            </p>
          </div>
        </div>
      )}

      {/* Plan Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Premium Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-xl">⭐</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Priority Listings</h3>
            <p className="text-sm text-gray-600">Get your saved listings featured at the top of search results.</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">🔔</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Notifications</h3>
            <p className="text-sm text-gray-600">Get notified immediately when new properties match your criteria.</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 text-xl">💬</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Direct Agent Access</h3>
            <p className="text-sm text-gray-600">Connect directly with verified real estate agents.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSubscription;

