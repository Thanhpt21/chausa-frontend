'use client';

import ImportTable from '@/components/admin/import/ImportTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminImportPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách phiếu nhập kho</Title>
      <ImportTable />
    </div>
  );
}
