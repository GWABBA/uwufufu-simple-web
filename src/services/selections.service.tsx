import axios from 'axios';
import api from './api.service';
import {
  CreateSelectionWithVideo,
  SelectionDto,
  SelectionsResponseDto,
} from '@/dtos/selection.dtos';

export const fetchSelections = async (params: {
  page: number;
  perPage: number;
  worldcupId: number;
}): Promise<SelectionsResponseDto> => {
  try {
    const { data } = await api.get<SelectionsResponseDto>('/selections', {
      params,
    });
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Fetching selections failed'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const fetchSelectionsForEdit = async (params: {
  page: number;
  perPage: number;
  worldcupId: number;
  keyword?: string;
}): Promise<SelectionsResponseDto> => {
  try {
    const { data } = await api.get<SelectionsResponseDto>('/selections/mine', {
      params,
    });
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Uploading selection failed'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const createSelectionWithImage = async (
  formData: FormData
): Promise<SelectionDto | null> => {
  try {
    const { data } = await api.post<SelectionDto>(
      '/selections/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Uploading selection failed'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const createSelectionWithVideo = async (
  body: CreateSelectionWithVideo
): Promise<SelectionDto | null> => {
  try {
    const { data } = await api.post<SelectionDto>('/selections/video', body);

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Uploading selection failed'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const updateSelection = async (body: {
  gameId: number;
  selectionId: number;
  name: string;
  resourceUrl: string;
}): Promise<SelectionDto> => {
  try {
    const { data } = await api.patch<SelectionDto>('/selections', body);

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Updating selection name failed'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const deleteSelection = async (selectionId: number): Promise<void> => {
  try {
    await api.delete(`/selections/${selectionId}`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Deleting selection failed'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};
