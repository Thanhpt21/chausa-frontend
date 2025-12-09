'use client';

import SalaryTable from '@/components/admin/salary/SalaryTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminSalaryPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Quản lý lương nhân viên</Title>
      <SalaryTable />
    </div>
  );
}