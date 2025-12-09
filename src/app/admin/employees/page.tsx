'use client';

import EmployeeTable from '@/components/admin/employee/EmployeeTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminEmployeePage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách nhân viên</Title>
      <EmployeeTable />
    </div>
  );
}