'use client';

import {
  Table,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

import { useCustomers } from '@/hooks/customer/useCustomers';
import { useDeleteCustomer } from '@/hooks/customer/useDeleteCustomer';
import { Customer } from '@/types/customer.type'; // Bạn cần định nghĩa type này
import { CustomerCreateModal } from './CustomerCreateModal';
import { CustomerUpdateModal } from './CustomerUpdateModal';
import { formatDate } from '@/utils/helpers';
import { CustomerListModal } from './CustomerListModal';

export default function CustomerTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [openListModal, setOpenListModal] = useState(false);

  const { data, isLoading, refetch } = useCustomers({ page, limit: 10, search });
  const { mutateAsync: deleteCustomer } = useDeleteCustomer();

  const columns: ColumnsType<Customer> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'MST',
      dataIndex: 'mst',
      key: 'mst',
    },
    {
      title: 'Điểm thành viên',
      dataIndex: 'loyaltyPoint',
      key: 'loyaltyPoint',
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (createdAt: string) => {
        return formatDate(createdAt); // Sử dụng hàm formatDate để định dạng ngày
        },
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
                setSelectedCustomer(record);
                setOpenUpdate(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá khách hàng',
                  content: `Bạn có chắc chắn muốn xoá "${record.name}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteCustomer(record.id);
                      message.success('Xoá khách hàng thành công');
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
    <div style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm khách hàng..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-full max-w-xs"
          />
          <Button type="primary" onClick={handleSearch}>
            <SearchOutlined /> Tìm kiếm
          </Button>
        </div>
        <div className='flex justify-content gap-2'>
           <Button onClick={() => setOpenListModal(true)}>
              Xem tất cả
            </Button>
          <Button type="primary" onClick={() => setOpenCreate(true)}>
            Thêm khách hàng
          </Button>
        </div>
       
      </div>

       <div style={{ overflowX: 'auto' }}>
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
      </div>

      <CustomerCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <CustomerUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        customer={selectedCustomer}
        refetch={refetch}
      />

      <CustomerListModal
        open={openListModal}
        onClose={() => setOpenListModal(false)}
      />
    </div>
  );
}
