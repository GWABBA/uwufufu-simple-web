'use client';

import { useAppSelector } from '@/store/hooks';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetchActiveSubscription } from '@/services/payment.service';

interface CustomPayPalButtonsProps {
  planId: string;
}

export default function CustomPayPalButtons({
  planId,
}: CustomPayPalButtonsProps) {
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  const handleUnauthorized = () => {
    toast.error('You must be logged in to subscribe to a plan.');
    router.push('/auth/login?redirect=/plans');
  };

  const validateSubscription = async () => {
    try {
      const activeSubscription = await fetchActiveSubscription();
      if (activeSubscription) {
        toast.error('You already have an active subscription.');
        return false;
      }
      return false;
    } catch (error) {
      // If error is 404, it means no active subscription
      if (error instanceof Error && error.message.includes('404')) {
        return true;
      }
      // toast.error('Failed to validate subscription status.');
      return true;
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full relative">
      {!user ? (
        <div
          className="absolute w-full h-full z-10 cursor-pointer"
          onClick={handleUnauthorized}
        />
      ) : null}

      <div className="z-0">
        {/* ✅ Custom PayPal Subscription Button */}
        <PayPalButtons
          createSubscription={async (data, actions) => {
            const isValid = await validateSubscription();
            if (!isValid) {
              throw new Error('Subscription validation failed');
            }
            return actions.subscription.create({
              plan_id: planId,
              custom_id: user!.id?.toString(),
            });
          }}
          onApprove={async (data) => {
            console.log('Subscription Approved:', data);
            toast.success(
              'Thank you for subscribing! 🎉 Please wait while we process your payment.'
            );
          }}
          onError={(err) => {
            console.error('PayPal Subscription Error:', err);
            toast.error(
              'Something went wrong with the subscription. Please try again.'
            );
          }}
          fundingSource="paypal"
          style={{
            color: 'blue',
            shape: 'pill',
            label: 'subscribe',
            tagline: false,
            height: 45,
          }}
        />

        {/* ✅ Custom Debit/Credit Card Subscription Button */}
        <PayPalButtons
          createSubscription={async (data, actions) => {
            const isValid = await validateSubscription();
            if (!isValid) {
              throw new Error('Subscription validation failed');
            }
            return actions.subscription.create({
              plan_id: planId,
              custom_id: user!.id?.toString(),
            });
          }}
          onApprove={async (data) => {
            console.log('Subscription Approved:', data);
            toast.success(
              'Thank you for subscribing! 🎉 Please wait while we process your payment.'
            );
          }}
          onError={(err) => {
            console.error('PayPal Subscription Error:', err);
            toast.error(
              'Something went wrong with the subscription. Please try again.'
            );
          }}
          fundingSource="card"
          style={{
            color: 'black',
            shape: 'pill',
            label: 'subscribe',
            tagline: false,
            height: 45,
          }}
        />
      </div>
    </div>
  );
}
