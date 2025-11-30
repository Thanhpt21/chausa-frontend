'use client';

import CustomerTable from '@/components/admin/customer/CustomerTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminCustomerPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách khách hàng</Title>
      <CustomerTable />
    </div>
  );
}
