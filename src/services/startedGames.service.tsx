import config from '@/config';
import {
  AddResultImageToStartedGameDto,
  CreateStartedGameDto,
  PickSelectionDto,
  StartedGameResponseDto,
  StartedGameResultDto,
  StartedGameWithGameResponseDto,
} from '@/dtos/startedGames.dtos';
import axios from 'axios';
import api from './api.service';

export const fetchMyStartedGames = async (query: {
  page: number;
  perPage: number;
}): Promise<StartedGameWithGameResponseDto[]> => {
  const page = query.page || 1;
  const perPage = query.perPage || 10;

  try {
    const { data } = await api.get<StartedGameWithGameResponseDto[]>(
      `${config.apiUrl}/started-games`,
      {
        params: {
          page,
          perPage,
        },
      }
    );
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch my started games'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const createStartedGame = async (
  body: CreateStartedGameDto
): Promise<StartedGameResponseDto> => {
  try {
    const { data } = await api.post<StartedGameResponseDto>(
      `${config.apiUrl}/started-games`,
      body
    );
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to start a new game'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const pickSelection = async (
  body: PickSelectionDto
): Promise<StartedGameResponseDto | null> => {
  try {
    const { data } = await axios.post<StartedGameResponseDto>(
      `${config.apiUrl}/started-games/pick`,
      body
    );
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to pick a selection'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const addResultImageToStartedGame = async (
  body: AddResultImageToStartedGameDto
): Promise<StartedGameResponseDto> => {
  try {
    const { data } = await axios.patch<StartedGameResponseDto>(
      `${config.apiUrl}/started-games/add-result-image`,
      body
    );
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to add result image'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const fetchStartedGameBySlugAndId = async (
  slug: string,
  id: number
): Promise<StartedGameResultDto | null> => {
  try {
    const { data } = await axios.get<StartedGameResultDto>(
      `${config.apiUrl}/started-games/${id}/${slug}/result`
    );
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch started game'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const fetchStartedGameById = async (
  id: number
): Promise<StartedGameResponseDto> => {
  try {
    const { data } = await api.get<StartedGameResponseDto>(
      `${config.apiUrl}/started-games/${id}`
    );
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch started game'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const deleteStartedGame = async (id: number): Promise<void> => {
  try {
    await api.delete(`${config.apiUrl}/started-games/${id}`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete started game'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};
