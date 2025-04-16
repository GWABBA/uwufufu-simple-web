import config from '@/config';
import {
  AddResultImageToStartedGameDto,
  CreateStartedGameDto,
  PickSelectionDto,
  StartedGameResponseDto,
  StartedGameResultDto,
} from '@/dtos/startedGames.dtos';
import axios from 'axios';
import api from './api.service';

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
