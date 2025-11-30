'use client'

import WarrantyTable from '@/components/admin/warranty/WarrantyTable'
import { Typography } from 'antd'

const { Title } = Typography

export default function AdminWarrantyPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">Danh sách bảo hành</Title>
      <WarrantyTable />
    </div>
  )
}