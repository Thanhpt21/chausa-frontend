// app/admin/transfer/page.tsx

'use client';

import TransferTable from '@/components/admin/transfer/TransferTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminTransferPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách Mã đơn hàng</Title>
      <TransferTable /> 
    </div>
  );
}
