import Cookies from "js-cookie";

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  gender: string | null;
  type_account: string;
  avatar: string | null;
  isActive: boolean;
}

export const getCurrentUser = async (): Promise<CurrentUser> => {
  try {
   
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/current`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Đảm bảo cookie xác thực được gửi đi
      cache: 'no-store',
    });

    if (response.status === 401) {
      throw new Error('Unauthorized: No active user session.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy thông tin người dùng.');
    }

    const data = await response.json();

  
    return data.data;
  } catch (error: any) {
    // Xử lý lỗi một cách chi tiết, có thể log lỗi hoặc thông báo
    console.error('Lỗi khi lấy thông tin người dùng:', error.message);
    throw new Error(error.message || 'Lỗi không xác định');
  }
};
