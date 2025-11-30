// app/admin/export/page.tsx

'use client';

import ExportTable from '@/components/admin/export/ExportTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminExportPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách báo giá</Title>
      <ExportTable />
    </div>
  );
}
