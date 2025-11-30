'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useCurrent, CurrentUser } from '@/hooks/auth/useCurrent'; // Đảm bảo đúng đường dẫn tới hook của bạn

// Định nghĩa kiểu dữ liệu cho context value
interface AuthContextType {
  currentUser: CurrentUser | undefined;
  isLoading: boolean;
  isError: boolean;
  refetchCurrentUser: () => void; // Hàm để refetch user data thủ công
}

// Tạo AuthContext với giá trị mặc định (sẽ được ghi đè bởi Provider)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props cho AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Component AuthProvider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data, isLoading, isError, refetch } = useCurrent();

  // Sử dụng useMemo để tránh việc tạo lại object context value không cần thiết
  const contextValue = useMemo(() => {
    return {
      currentUser: data,
      isLoading,
      isError,
      refetchCurrentUser: refetch,
    };
  }, [data, isLoading, isError, refetch]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng AuthContext một cách thuận tiện
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};