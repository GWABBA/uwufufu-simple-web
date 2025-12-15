import {
  MyWorldcupListQuery,
  Worldcup,
  WorldcupListQuery,
  WorldcupsListResponse,
} from '@/dtos/worldcup.dtos';
import axios from 'axios';
import api from './api.service';
import { MessageResponse } from '@/dtos/common.dtos';

export const fetchWorldcups = async (
  params: WorldcupListQuery
): Promise<WorldcupsListResponse> => {
  try {
    const { data } = await api.get<WorldcupsListResponse>('/games', {
      params,
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value === undefined || value === null) return; // ✅ Skip undefined/null values

          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v)); // ✅ No `[]` in keys
          } else {
            searchParams.append(key, String(value));
          }
        });
        return searchParams.toString();
      },
    });
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch worldcups'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const createWorldcup = async (
  worldcupData: Worldcup
): Promise<Worldcup> => {
  try {
    const { data } = await api.post<Worldcup>(`/games`, worldcupData);

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

export const fetchWorldcupBySlug = async (
  slug: string
): Promise<Worldcup | null> => {
  try {
    const { data } = await api<Worldcup>(`/games/${slug}/slug`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null; // Return null if the worldcup is not found
      }
      throw new Error(
        error.response?.data?.message || 'Failed to fetch worldcup'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const fetchMyWorldcup = async (id: number): Promise<Worldcup | null> => {
  try {
    const { data } = await api<Worldcup>(`/games/${id}/mine`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch worldcup'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const fetchMyWorldcups = async (
  params: MyWorldcupListQuery
): Promise<WorldcupsListResponse> => {
  try {
    const { data } = await api.get<WorldcupsListResponse>('/games/mine', {
      params,
    });

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch worldcups'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const updateWorldcup = async (
  worldcupData: Worldcup
): Promise<Worldcup> => {
  try {
    const { data } = await api.put<Worldcup>(
      `/games/${worldcupData.id}`,
      worldcupData
    );
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Update worldcup request failed'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const deleteWorldcup = async (id: number): Promise<void> => {
  try {
    await api.delete(`/games/${id}`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Delete worldcup request failed'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const toggleWorldcupNSFW = async (
  id: number
): Promise<MessageResponse> => {
  try {
    const { data } = await api.put(`/games/${id}/nsfw`);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Toggle NSFW request failed'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const copyWorldcup = async (id: number): Promise<Worldcup> => {
  try {
    // POST /games/:id/copy 호출
    const { data } = await api.post<Worldcup>(`/games/${id}/copy`);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Copy worldcup request failed'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};
