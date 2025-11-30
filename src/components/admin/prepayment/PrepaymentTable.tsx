'use client';

import {
  Table,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
  Tag, // Import Tag để sử dụng
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

import { usePrepayments } from '@/hooks/prepayment/usePrepayments';
import { useDeletePrepayment } from '@/hooks/prepayment/useDeletePrepayment';
import { PrepaymentCreateModal } from './PrepaymentCreateModal';
import { PrepaymentUpdateModal } from './PrepaymentUpdateModal';
import { formatDate } from '@/utils/helpers';
import { Prepayment } from '@/types/prepayment.type';

export default function PrepaymentTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedPrepayment, setSelectedPrepayment] = useState<Prepayment | null>(null);

  const { data, isLoading, refetch } = usePrepayments({ page, limit: 10, search });
  const { mutateAsync: deletePrepayment } = useDeletePrepayment();

  // Màu sắc cho các trạng thái

  const statusLabels: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };


  const statusColors: Record<string, string> = {
    PENDING: 'orange',
    PROCESSING: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'red',
  };

  const columns: ColumnsType<Prepayment> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Khách hàng',
      dataIndex: ['customer', 'name'],  // Đường dẫn vào trường 'name' trong object 'customer'
      key: 'customerName',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amountMoney',
      key: 'amountMoney',
      render: (amount: number) => `${amount.toLocaleString()} VNĐ`,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: 'Ngày đặt cọc',
      dataIndex: 'date',  // Sử dụng trường 'date' nếu đó là tên đúng của trường ngày đặt cọc
      key: 'date',
      render: (date: string) => {
        return formatDate(date);  // Sử dụng hàm formatDate cho ngày đặt cọc
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
         <Tag color={statusColors[status] || 'default'}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    // {
    //   title: 'Hành động',
    //   key: 'action',
    //   width: 150,
    //   render: (_, record) => (
    //     <Space size="middle">
    //       <Tooltip title="Chỉnh sửa">
    //         <EditOutlined
    //           style={{ color: '#1890ff', cursor: 'pointer' }}
    //           onClick={() => {
    //             setSelectedPrepayment(record);
    //             setOpenUpdate(true);
    //           }}
    //         />
    //       </Tooltip>
    //       <Tooltip title="Xoá">
    //         <DeleteOutlined
    //           style={{ color: 'red', cursor: 'pointer' }}
    //           onClick={() => {
    //             Modal.confirm({
    //               title: 'Xác nhận xoá phiếu thanh toán',
    //               content: `Bạn có chắc chắn muốn xoá phiếu thanh toán của "${record.customerName}" không?`,
    //               okText: 'Xoá',
    //               okType: 'danger',
    //               cancelText: 'Hủy',
    //               onOk: async () => {
    //                 try {
    //                   await deletePrepayment(record.id);
    //                   message.success('Xoá phiếu thanh toán thành công');
    //                   refetch();
    //                 } catch (error: any) {
    //                   message.error(error?.response?.data?.message || 'Xoá thất bại');
    //                 }
    //               },
    //             });
    //           }}
    //         />
    //       </Tooltip>
    //     </Space>
    //   ),
    // },
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
            placeholder="Tìm kiếm thanh toán..."
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
        {/* <Button type="primary" onClick={() => setOpenCreate(true)}>
          Thêm phiếu thanh toán
        </Button> */}
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

      <PrepaymentCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <PrepaymentUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        prepayment={selectedPrepayment}
        refetch={refetch}
      />
    </div>
  );
}
