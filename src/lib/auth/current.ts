// lib/auth/current.ts

import { api } from "../axios";

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phoneNumber: string | null;
  gender: string | null;
  type_account: string;
  profilePicture: string | null;
  isActive: boolean;
}

export const getCurrentUser = async (): Promise<CurrentUser> => {
  try {
    const response = await api.get('/auth/current')
    return response.data
  } catch (error: any) {
    console.error('Error fetching current user:', error)
    throw error
  }
}