'use client';


import PurchaseRequestTable from '@/components/admin/purchase-request/PurchaseRequestTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminPurchaseRequestPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách phiếu mua hàng</Title>
      <PurchaseRequestTable />
    </div>
  );
}