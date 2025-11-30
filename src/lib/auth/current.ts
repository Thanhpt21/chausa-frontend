// lib/auth/current.ts

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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/current`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Đảm bảo dòng này có mặt! Nó cho phép trình duyệt gửi cookie xác thực đã lưu.
    credentials: 'include',
  });

  if (response.status === 401) {
    // Quan trọng: Nếu không được ủy quyền, throw lỗi.
    // Điều này giúp useQuery nhận biết phiên không hợp lệ và reset state.
    throw new Error('Unauthorized: No active user session.');
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể lấy thông tin người dùng.');
  }

  return response.json();
};