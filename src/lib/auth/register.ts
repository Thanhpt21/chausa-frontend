// lib/auth/register.ts

// Định nghĩa kiểu dữ liệu cho body của request đăng ký
// Bạn cần đảm bảo các trường này khớp với CreateUserDto ở backend của bạn
export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

// Định nghĩa kiểu phản hồi từ API khi đăng ký
interface RegisterApiResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    email: string;
    role: string;
    phoneNumber: string | null;
    gender: string | null;
    type_account: string;
    isActive: boolean;
  };
}

export const register = async (body: RegisterBody): Promise<RegisterApiResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, { // Hoặc trực tiếp '/auth/register' nếu không qua Next.js API route
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Đăng ký thất bại.');
  }

  return response.json();
};