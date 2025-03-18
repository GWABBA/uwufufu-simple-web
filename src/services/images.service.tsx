import axios from 'axios';
import { ImageResponse } from '@/dtos/images.dtos';
import api from './api.service';

export const uploadImage = async (
  formData: FormData
): Promise<ImageResponse> => {
  try {
    const { data } = await api.post<ImageResponse>('/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // ✅ Required for file uploads
      },
    });
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to upload image'
      );
    }
    throw new Error('An unexpected error occurred');
  }
};
