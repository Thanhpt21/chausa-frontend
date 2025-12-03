'use client'
// app/admin/layout.tsx
import AdminLayout from '@/components/admin/layout.admin';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Middleware sẽ xử lý việc kiểm tra auth token từ cookie
  // Không cần kiểm tra ở đây nữa
  return <AdminLayout>{children}</AdminLayout>;
}