// components/plans/PlansPageClient.tsx
'use client';

import PayPalSubscriptionButton from '@/components/payment/PaypalButton';
import StripeButtons from '@/components/payment/StripeButton';
import { useAppSelector } from '@/store/hooks';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PlansPageClient({
  paymentOptions,
}: {
  paymentOptions: string[];
}) {
  const { t } = useTranslation();

  const user = useAppSelector((state) => state.auth.user);
  const availablePlan = process.env.NEXT_PUBLIC_PLUS_PLAN!;

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '',
        currency: 'USD',
        components: 'buttons',
        intent: 'subscription',
        vault: true,
      }}
    >
      <div className="w-full max-w-4xl mx-auto pt-4 md:pt-8 px-2 md:px-0">
        <h1 className="text-xl md:text-4xl font-extrabold text-white mb-4">
          {t('plans.plans')}
        </h1>
        <div className="flex justify-center">
          <div className="w-full md:w-1/2 border border-uwu-gray p-4 rounded-md">
            <h4 className="text-2xl mb-2 text-center text-white font-bold">
              {t('plans.plus-plan')}
            </h4>
            <p className="text-center mb-4 text-white">
              <span className="text-3xl text-uwu-red">$5</span> /{' '}
              {t('plans.1-month')}
            </p>
            <div className="mb-8">
              <p className="text-white pl-4 flex items-center mb-2">
                <Check
                  size={18}
                  strokeWidth={4}
                  className="text-uwu-red mr-2"
                />
                {t('plans.remove-ads')}
              </p>
              <p className="text-white pl-4 flex items-center mb-2">
                <Check
                  size={18}
                  strokeWidth={4}
                  className="text-uwu-red mr-2"
                />
                {t('plans.access-to-nsfw')}
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3">
              {user && user.tier == 'plus' ? (
                <div className="text-uwu-red text-lg">
                  {t('plans.your-current-plan')}
                </div>
              ) : (
                <>
                  {/* PayPal subscription button */}
                  {availablePlan && paymentOptions.includes('paypal') && (
                    <PayPalSubscriptionButton planId={availablePlan} />
                  )}

                  {/* Stripe subscription button */}
                  {paymentOptions.includes('stripe') && <StripeButtons />}
                </>
              )}

              {user && user.isAdmin && (
                <div>
                  <PayPalSubscriptionButton planId={availablePlan} />
                  <br />
                  <StripeButtons />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
