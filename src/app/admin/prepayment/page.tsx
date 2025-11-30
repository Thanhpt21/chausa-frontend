'use client';

import PrepaymentTable from '@/components/admin/prepayment/PrepaymentTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminPrepaymentPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách thanh toán trước</Title>
      <PrepaymentTable />
    </div>
  );
}
