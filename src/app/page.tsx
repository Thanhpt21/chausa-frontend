'use client';

import Image from 'next/image';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import logo from '../assets/images/cslogo.jpg';
import bg from '../assets/banner/bg.jpg';

export default function Page() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center space-y-4 text-white"
      style={{
        backgroundImage: `url(${bg.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Logo */}
      <div>
        <Image src={logo.src} alt="Logo" width={150} height={150} />
      </div>

      <p>Xin chào</p>

      {/* Nút điều hướng */}
      <Button type="primary" onClick={() => router.push('/login')}>
        Đăng nhập vào trang quản trị
      </Button>
    </div>
  );
}