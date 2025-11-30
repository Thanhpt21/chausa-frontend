'use client';

import {
  Table,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
  Tag,
  Switch,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useState } from 'react';


import { Warranty } from '@/types/warranty.type';
import { formatDate } from '@/utils/helpers';
import { useWarranties } from '@/hooks/warranty/useWarranties';
import { useDeleteWarranty } from '@/hooks/warranty/useDeleteWarranty';
import { WarrantyCreateModal } from './WarrantyCreateModal';
import { WarrantyUpdateModal } from './WarrantyUpdateModal';
import { useUpdateWarranty } from '@/hooks/warranty/useUpdateWarranty';

export default function WarrantyTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);

  const { data, isLoading, refetch } = useWarranties({ page, limit: 10, search });
  const { mutateAsync: deleteWarranty } = useDeleteWarranty();

  const { mutateAsync: updateWarrantyStatus } = useUpdateWarranty();
  const updateStatus = async (id: number, isResolved: boolean) => {
    await updateWarrantyStatus({ id, data: { isResolved } });
  };

  const columns: ColumnsType<Warranty> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên sản phẩm',
      key: 'title',
      render: (_, record) => record.title || 'Không rõ',
    },
    {
      title: 'Model',
      key: 'model',
      render: (_, record) => record.model || 'Không rõ',
    },
    {
      title: 'Màu sắc',
      key: 'colorTitle',
      render: (_, record) => record.colorTitle || 'Không rõ',
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_, record) => record.quantity ?? 'Không rõ',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => formatDate(createdAt),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isResolved',
      key: 'isResolved',
      render: (isResolved: boolean, record: Warranty) => (
        <Switch
          checked={isResolved}
          checkedChildren="Đã xử lý"
          unCheckedChildren="Chưa xử lý"
          onChange={async (checked) => {
            try {
              await updateStatus(record.id, checked);
              message.success('Cập nhật trạng thái thành công');
              refetch?.();
            } catch (error: any) {
              message.error(error?.response?.data?.message || 'Cập nhật thất bại');
            }
          }}
        />
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedWarranty(record);
                setOpenUpdate(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá bảo hành',
                  content: `Bạn có chắc chắn muốn xoá bảo hành của sản phẩm "${record.title}"?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteWarranty(record.id);
                      message.success('Xoá bảo hành thành công');
                      refetch();
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xoá thất bại');
                    }
                  },
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = () => {
    setPage(1);
    setSearch(inputValue);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Button type="primary" onClick={handleSearch}>
            <SearchOutlined /> Tìm kiếm
          </Button>
        </div>
        <Button type="primary" onClick={() => setOpenCreate(true)}>
          Thêm bảo hành
        </Button>
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
        }}
      />

      <WarrantyCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <WarrantyUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        warranty={selectedWarranty}
        refetch={refetch}
      />
    </div>
  );
}
