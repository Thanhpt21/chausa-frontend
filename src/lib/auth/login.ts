// lib/auth/login.ts
export interface LoginBody {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  access_token: string
  user: {
    id: number
    name: string
    email: string
    phoneNumber: string | null
    gender: string | null
    type_account: string
    isActive: boolean
  }
}

export const login = async (body: LoginBody): Promise<LoginResponse> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error('Đăng nhập thất bại');
  }

  const data = await res.json();
  
  // Lưu token vào localStorage làm backup
  if (data.access_token) {
    localStorage.setItem('accessToken', data.access_token);
  }
  
  return data;
};


