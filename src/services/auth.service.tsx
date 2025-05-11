import {
  LoginDto,
  PasswordResetRequestDto,
  RegisterDto,
  TokensResponse,
} from '@/dtos/auth.dtos';
import { User } from '@/dtos/user.dtos';
import axios from 'axios';
// import { cookies } from 'next/headers';
import Cookies from 'js-cookie';
import api from './api.service';
import { MessageResponse } from '@/dtos/common.dtos';
import { logout } from '@/store/slices/auth.reducer';
import { NextResponse } from 'next/server';

export const TOKEN_COOKIE_NAME = 'accessToken';

// Save token to cookies for persistence
const saveTokenToCookie = (token: string) => {
  Cookies.set(TOKEN_COOKIE_NAME, token, { expires: 7 }); // Save token for 7 days
};

export const login = async (body: LoginDto): Promise<TokensResponse> => {
  try {
    const { data } = await api.post<TokensResponse>('/auth/login', body);

    saveTokenToCookie(data.accessToken);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Login request failed');
    }

    throw new Error('An unexpected error occurred');
  }
};

export const updateUser = async (body: User): Promise<User> => {
  try {
    const { data } = await api.put<User>('/auth/me', body);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }

    throw new Error('An unexpected error occurred');
  }
};

export const updateUserName = async (body: { name: string }): Promise<User> => {
  try {
    const { data } = await api.put<User>('/auth/me/name', body);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to update user name'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const register = async (body: RegisterDto): Promise<TokensResponse> => {
  try {
    const { data } = await api.post<TokensResponse>('/auth/register', body);
    saveTokenToCookie(data.accessToken);

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Registration request failed'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const fetchMeSSR = async (token: string) => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    logout();
    await removeTokenSSR();
  }
};

// ✅ Removes token from cookies in SSR
const removeTokenSSR = () => {
  const response = NextResponse.next();
  response.cookies.set(TOKEN_COOKIE_NAME, '', {
    expires: new Date(0), // Expire immediately
    path: '/',
  });
  return response;
};

export const fetchMe = async (): Promise<User> => {
  try {
    const { data } = await api.get<User>('/auth/me');
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }

    throw new Error('An unexpected error occurred');
  }
};

export const updatedPassword = async (
  newPassword: string
): Promise<MessageResponse> => {
  try {
    const { data } = await api.patch<MessageResponse>('/auth/password', {
      newPassword,
    });
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to update password'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const sendEmailConfirmationEmail =
  async (): Promise<MessageResponse> => {
    try {
      const { data } = await api.post<MessageResponse>(
        '/email/email-confirmation'
      );
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to send verification email'
        );
      }

      throw new Error('An unexpected error occurred');
    }
  };

export const verifyEmail = async (token: string): Promise<MessageResponse> => {
  try {
    const { data } = await api.patch<MessageResponse>('/auth/verify-email', {
      token,
    });
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to verify email'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const createPasswordReset = async (
  body: PasswordResetRequestDto
): Promise<MessageResponse> => {
  try {
    const { data } = await api.post<MessageResponse>('/password-reset', body);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Password reset request failed'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};

export const resetPassword = async (password: string, token: string) => {
  try {
    const { data } = await api.patch<MessageResponse>('/password-reset', {
      password,
      token,
    });
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to reset password'
      );
    }

    throw new Error('An unexpected error occurred');
  }
};
