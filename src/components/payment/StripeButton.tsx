'use client';

import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  createStripeCheckoutSession,
  fetchActiveSubscription,
} from '@/services/payment.service';

interface StripeButtonsProps {
  priceId?: string;
  successUrl?: string;
  cancelUrl?: string;
  label?: string;
}

export default function StripeButtons({
  priceId,
  successUrl,
  cancelUrl,
  label = 'Subscribe with Stripe',
}: StripeButtonsProps) {
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function validateSubscription(): Promise<boolean> {
    try {
      const active = await fetchActiveSubscription();
      if (active) {
        toast.error('You already have an active subscription.');
        return false;
      }
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_e: unknown) {
      // Treat unknown errors (incl. 404) as "no active sub"
      return true;
    }
  }

  async function onClick() {
    if (!user) {
      toast.error('You must be logged in to subscribe to a plan.');
      router.push('/auth/login?redirect=/plans');
      return;
    }

    const ok = await validateSubscription();
    if (!ok) return;

    try {
      setLoading(true);

      const { url } = await createStripeCheckoutSession(
        priceId,
        successUrl,
        cancelUrl
      );

      if (!url) throw new Error('Checkout URL missing');
      window.location.href = url;
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Could not start Stripe checkout.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full px-4 py-2 rounded-full bg-uwu-red text-white disabled:opacity-50"
    >
      {loading ? 'Redirecting…' : label}
    </button>
  );
}
