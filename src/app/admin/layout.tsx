'use client'
// app/admin/layout.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/layout.admin';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      // Nếu không có token, chuyển hướng người dùng về trang login
      router.push('/login');
    }
  }, [router]);

  return <AdminLayout>{children}</AdminLayout>;
}