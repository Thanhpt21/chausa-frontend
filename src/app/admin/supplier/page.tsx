'use client';

import SupplierTable from '@/components/admin/supplier/SupplierTable'; // Đảm bảo rằng bạn đã tạo SupplierTable
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminSupplierPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách nhà cung cấp</Title>
      <SupplierTable /> 
    </div>
  );
}
