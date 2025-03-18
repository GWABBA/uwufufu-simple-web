'use client';

import { useAppSelector } from '@/store/hooks';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
          createSubscription={(data, actions) => {
            return actions.subscription.create({
              plan_id: planId,
              custom_id: user!.id?.toString(),
            });
          }}
          onApprove={async (data) => {
            console.log('Subscription Approved:', data);
            alert(
              'Thank you for subscribing! 🎉. Please wait until paypal has processed the payment.'
            );
          }}
          onError={(err) => {
            console.error('PayPal Subscription Error:', err);
            alert('Something went wrong with the subscription.');
          }}
          fundingSource="paypal" // ✅ Forces only the PayPal Wallet button
          style={{
            color: 'blue', // blue, silver, white, black
            shape: 'pill', // pill, rect
            label: 'subscribe',
            tagline: false, // Removes "Powered by PayPal"
            height: 45,
          }}
        />

        {/* ✅ Custom Debit/Credit Card Subscription Button */}
        <PayPalButtons
          createSubscription={(data, actions) => {
            return actions.subscription.create({
              plan_id: planId,
            });
          }}
          onApprove={async (data) => {
            console.log('Subscription Approved:', data);
            alert(
              'Thank you for subscribing! 🎉. Please wait until paypal has processed the payment.'
            );
          }}
          onError={(err) => {
            console.error('PayPal Subscription Error:', err);
            alert('Something went wrong with the subscription.');
          }}
          fundingSource="card" // ✅ Forces only the Debit/Credit Card button
          style={{
            color: 'black', // Matches a clean UI
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
