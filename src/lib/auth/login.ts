// lib/auth/login.ts
export interface LoginBody {
  email: string
  password: string
}


export const login = async (body: LoginBody) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 👈 BẮT BUỘC để nhận cookie từ server
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error('Đăng nhập thất bại');
  }

  const data = await res.json();
  console.log('Login Response:', data); // Kiểm tra dữ liệu trả về

  if (typeof window !== 'undefined') {
    if (data.success && data.user?.access_token) {
      // Lưu access_token vào localStorage
      localStorage.setItem('accessToken', data.user.access_token); 
      // Chuyển hướng đến trang admin
      setTimeout(() => {
        window.location.href = '/admin'; 
      }, 100); // Đảm bảo token đã được lưu
    } else {
      throw new Error(data.message || 'Login failed');
    }
  }

  return data;
};
