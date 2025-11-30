'use client';

import { useState } from 'react';
import { Table, Input, Button, Space, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';

import { useExportDetails } from '@/hooks/export-detail/useExportDetails';
import { formatDate, formatVND } from '@/utils/helpers';
import { ExportDetail } from '@/types/export-detail.type';

export default function QuotationTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');

  const { data, isLoading, refetch } = useExportDetails({
    page,
    limit: 10,
    search,
  });

  const columns: ColumnsType<ExportDetail> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Sản phẩm',
      dataIndex: ['product', 'title'],
      key: 'productTitle',
    },
    {
      title: 'SKU',
      dataIndex: ['product', 'sku'],
      key: 'productSku',
    },
    {
      title: 'Đơn vị',
      dataIndex: ['product', 'unit'],
      key: 'productUnit',
      render: (unit) => unit || '-',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => formatVND(price),
    },
    {
      title: 'VAT (%)',
      dataIndex: 'vat',
      key: 'vat',
      render: (vat) => vat + '%',
    },
    {
      title: 'Ngày xuất',
      dataIndex: ['export', 'export_date'],
      key: 'exportDate',
      render: (date) => formatDate(date),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => formatDate(date),
    },
  ];

  const handleSearch = () => {
    setPage(1);
    setSearch(inputValue);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Space>
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={handleSearch}>
            <SearchOutlined /> Tìm kiếm
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
      />
    </div>
  );
}
