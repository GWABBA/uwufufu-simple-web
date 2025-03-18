'use client';

import PayPalSubscriptionButton from '@/components/paypal/PaypalButton';
import { useAppSelector } from '@/store/hooks';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchLatestPayment as fetchLatestPaymentService } from '@/services/payment.service';
import LoadingAnimation from '@/components/animation/Loading';
import { useTranslation } from 'react-i18next';

export default function PlansPage() {
  const { t } = useTranslation();

  const user = useAppSelector((state) => state.auth.user);
  const [latestPaymentExists, setLatestPaymentExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availablePlan, setAvailablePlan] = useState('');

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchLatestPayment = async () => {
      try {
        await fetchLatestPaymentService();
        setLatestPaymentExists(true);
        // selectedPlan = process.env.NEXT_PUBLIC_PLUS_PLAN!;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setLatestPaymentExists(false);
      } finally {
        // setAvailablePlan(selectedPlan); // Ensures it gets set in all cases
        setIsLoading(false);
      }
    };

    fetchLatestPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (latestPaymentExists === false) {
      setAvailablePlan(process.env.NEXT_PUBLIC_PLUS_PLAN_WITH_FREE!);
    } else {
      setAvailablePlan(process.env.NEXT_PUBLIC_PLUS_PLAN!);
    }
  }, [latestPaymentExists]);

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
          {!isLoading ? (
            <div className="w-full md:w-1/2 border border-uwu-gray p-4 rounded-md">
              <h4 className="text-2xl mb-2 text-center text-white font-bold">
                {t('plans.plus-plan')}
              </h4>
              <p className="text-center mb-4 text-white">
                <span className="text-3xl text-uwu-red">$5</span> /{' '}
                {t('plans.1-month')}
              </p>
              <div className="mb-8">
                {latestPaymentExists === false && (
                  <p className="pl-4 flex items-center mb-2 text-uwu-red text-base">
                    <Check
                      size={18}
                      strokeWidth={4}
                      className="text-uwu-red mr-2"
                    ></Check>
                    {t('plans.1-week-free-trial')}
                  </p>
                )}
                <p className="text-white pl-4 flex items-center mb-2">
                  <Check
                    size={18}
                    strokeWidth={4}
                    className="text-uwu-red mr-2"
                  ></Check>
                  {t('plans.remove-ads')}
                </p>
                <p className="text-white pl-4 flex items-center mb-2">
                  <Check
                    size={18}
                    strokeWidth={4}
                    className="text-uwu-red mr-2"
                  ></Check>
                  {t('plans.access-to-nsfw')}
                </p>
              </div>
              <div className="flex justify-center">
                {user && user.tier == 'plus' ? (
                  <div className="text-uwu-red text-lg">
                    {t('plans.your-current-plan')}
                  </div>
                ) : (
                  availablePlan && (
                    <PayPalSubscriptionButton
                      planId={availablePlan}
                    ></PayPalSubscriptionButton>
                  )
                )}
              </div>
            </div>
          ) : (
            <LoadingAnimation />
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
