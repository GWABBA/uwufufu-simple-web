import { PaymentResponseDto } from '@/dtos/payment.dtos';
import api from './api.service';
import axios from 'axios';

export const fetchActiveSubscription =
  async (): Promise<PaymentResponseDto> => {
    try {
      const { data } = await api.get<PaymentResponseDto>(
        '/payments/active-subscription'
      );
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to fetch active subscription'
        );
      }

      throw new Error('An unexpected error occurred');
    }
  };

export const fetchLatestPayment = async (): Promise<PaymentResponseDto> => {
  try {
    const { data } = await api.get<PaymentResponseDto>(
      '/payments/latest-subscription'
    );
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch last payment'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const cancelSubscription = async (): Promise<void> => {
  try {
    await api.post('/auth/cancel-subscription');
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to cancel subscription'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

// stripe checkout session creation
export const createStripeCheckoutSession = async (
  priceId?: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<{ url: string }> => {
  try {
    const response = await api.post('/stripe/checkout-session', {
      priceId,
      successUrl,
      cancelUrl,
    });

    if (response.status !== 200) {
      throw new Error('Failed to create Stripe checkout session');
    }

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to create Stripe checkout session'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};
