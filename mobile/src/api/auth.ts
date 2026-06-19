import api from './client';
import type { ApiResponse, AuthTokens, User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthTokens & { user: User }>> => {
    const response = await api.post<ApiResponse<AuthTokens & { user: User }>>('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, planType: string = 'trial'): Promise<ApiResponse<{ temp_token: string; existing_user?: boolean }>> => {
    const response = await api.post('/auth/register', { email, plan_type: planType });
    return response.data;
  },

  verifyOtp: async (tempToken: string, otpCode: string): Promise<ApiResponse<{ verified_token: string }>> => {
    const response = await api.post('/auth/verify-otp', { temp_token: tempToken, otp_code: otpCode });
    return response.data;
  },

  setupAccount: async (verifiedToken: string, data: {
    restaurant_name: string;
    whatsapp_phone: string;
    username: string;
    password: string;
  }): Promise<ApiResponse<AuthTokens & { user: User }>> => {
    const response = await api.post('/auth/setup-account', {
      verified_token: verifiedToken,
      ...data,
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getPlans: async (): Promise<ApiResponse<void>> => {
    const response = await api.get('/auth/plans');
    return response.data;
  },
};
