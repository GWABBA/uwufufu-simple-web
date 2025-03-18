export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PasswordResetRequestDto {
  email: string;
}
