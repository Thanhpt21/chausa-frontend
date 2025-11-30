// src/components/layout/AppContent.tsx
'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';

interface AppContentProps {
  children: ReactNode;
}

export default function AppContent({ children }: AppContentProps) {

 
  return (
    <AuthProvider>
      <div className="">
        <main className="">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}