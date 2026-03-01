'use client';
import React, { useState } from 'react';

interface PaystackButtonProps {
  email: string;
  amount: number; // Amount in the smallest currency unit (e.g., kobo for NGN, pesewas for GHS)
  currency?: string;
  planId: number;
  planName: string;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
  publicKey: string;
  apiUrl?: string;
  token?: string;
}

const PaystackButton: React.FC<PaystackButtonProps> = ({
  email,
  amount,
  currency = 'KES',
  planId,
  planName,
  onSuccess,
  onClose,
  publicKey,
  apiUrl = 'http://localhost:8000/api',
  token,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    // Validate email
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }

    // Validate token
    if (!token) {
      setError('Please log in to make a payment');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Determine callback URL based on current route
      let callbackUrl = '/admin/subscription';
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/dashboard/subscription')) {
          callbackUrl = '/dashboard/subscription';
        } else if (currentPath.includes('/admin/subscription')) {
          callbackUrl = '/admin/subscription';
        }
      }

      // Initialize payment with backend
      const response = await fetch(`${apiUrl}/payments/initiate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id: planId,
          email: email,
          amount: amount,
          callback_url: typeof window !== 'undefined' ? `${window.location.origin}${callbackUrl}?payment=success` : '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      if (data.status === 'success' && data.data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('Invalid response from payment server');
      }
    } catch (err: any) {
      setError(err.message || 'Payment initialization failed');
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            Processing...
          </>
        ) : (
          `Pay ${currency} ${(amount / 100).toLocaleString()}`
        )}
      </button>
    </div>
  );
};

export default PaystackButton;

