import { MessageResponse } from '@/dtos/common.dtos';
import api from './api.service';
import axios from 'axios';

interface ReportCreateBody {
  gameId: number;
  reason: string;
}

export const createReport = async (
  reportCreateBody: ReportCreateBody
): Promise<MessageResponse> => {
  try {
    const { data } = await api.post<MessageResponse>(
      `/reports`,
      reportCreateBody
    );
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Create worldcup request failed'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};
