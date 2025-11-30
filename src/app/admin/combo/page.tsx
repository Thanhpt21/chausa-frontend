'use client';

import ComboTable from '@/components/admin/combo/ComboTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminComboPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách combo sản phẩm</Title>
      <ComboTable />
    </div>
  );
}
