import { PaymentResponseDto } from '@/dtos/payment.dtos';
import api from './api.service';
import axios from 'axios';

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
    await api.post('/payments/cancel-subscription');
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to cancel subscription'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};
