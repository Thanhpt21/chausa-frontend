'use client';

import { Typography } from 'antd';
import QuotationTable from '@/components/admin/history/QuotationTable';

const { Title } = Typography;

export default function AdminQuotationPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách báo giá</Title>
      <QuotationTable />
    </div>
  );
}
