'use client';

import {
  Table,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  Tag,
  message,
  Row,
  Col,
  DatePicker,
  Card,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  SearchOutlined,
  EyeOutlined,
  FileDoneOutlined,
  AppstoreAddOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { useTransfers } from '@/hooks/transfer/useTransfers';
import { Transfer, TransferStatus } from '@/types/transfer.type';
import { formatDate, formatVND } from '@/utils/helpers';
import TransferCreateModal from './TransferCreateModal';

import { useAuth } from '@/context/AuthContext';
import { useAllCustomers } from '@/hooks/customer/useAllCustomers';
import { TransferUpdateModal } from './TransferUpdateModal';
import TransferDetailModal from './TransferDetailModal';
import TransferFileExport from './TransferFileExport';
import { useUpdateTransferStatus } from '@/hooks/transfer/useUpdateTransferStatus';

const { RangePicker } = DatePicker;

const statusColors: Record<string, string> = {
  PENDING: 'orange',
  EXPORTED: 'cyan',
  CANCELLED: 'red',
  COMPLETED: 'green',
  PREPARED: 'geekblue',
  EXPIRED: 'gray',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  EXPORTED: 'Xuất kho',
  CANCELLED: 'Đã huỷ',
  COMPLETED: 'Hoàn thành',
  PREPARED: 'Đã gửi hàng',
  EXPIRED: 'Hết hạn',
};

export default function TransferTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openExportModal, setOpenExportModal] = useState(false);
  
  // Thêm state cho bộ lọc thời gian
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

  const { currentUser } = useAuth();
  const { data: transfersData, isLoading, refetch } = useTransfers({ 
    page, 
    limit: 10, 
    search,
    startDate,
    endDate,
  });

  const { mutateAsync: updateTransferStatus } = useUpdateTransferStatus();
  const { data: customers } = useAllCustomers({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const customerMap = customers?.reduce((acc: Record<number, string>, cur) => {
    acc[cur.id] = cur.name;
    return acc;
  }, {}) || {};

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    setStartDate(dateStrings[0] || undefined);
    setEndDate(dateStrings[1] || undefined);
    setPage(1); // Reset về trang đầu tiên khi filter
  };

  const handleResetDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  const handleMarkPrepared = async (transferRecord: Transfer) => {
    try {
      await updateTransferStatus({
        id: transferRecord.id,
        status: 'PREPARED' as TransferStatus,
      });
      refetch();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleMarkExported = (transferRecord: Transfer) => {
    Modal.confirm({
      title: 'Xác nhận xuất kho',
      content: `Bạn có chắc chắn muốn chuyển trạng thái sang "Xuất kho"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await updateTransferStatus({
            id: transferRecord.id,
            status: 'EXPORTED' as TransferStatus,
          });
          refetch();
          message.success('Cập nhật trạng thái thành công!');
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Cập nhật trạng thái thất bại');
        }
      },
    });
  };

  const handleMarkCompleted = (transferRecord: Transfer) => {
    Modal.confirm({
      title: 'Xác nhận hoàn thành',
      content: `Bạn có chắc chắn muốn chuyển trạng thái sang "Hoàn thành"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await updateTransferStatus({
            id: transferRecord.id,
            status: 'COMPLETED' as TransferStatus,
          });
          refetch();
          message.success('Cập nhật trạng thái thành công!');
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Cập nhật trạng thái thất bại');
        }
      },
    });
  };

  const columns: ColumnsType<Transfer> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerId',
      key: 'customerId',
      render: (customerId) => customerMap[customerId] || '-',
    },
    {
      title: 'Người tạo',
      dataIndex: ['user', 'name'],
      key: 'userName',
    },
    {
      title: 'Loại xuất kho',
      dataIndex: 'isInternal',
      key: 'isInternal',
      render: (isInternal) => isInternal ? 'Xuất kho nội bộ' : 'Xuất kho bán hàng',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => formatVND(amount),
    },
    {
      title: 'Ngày chuyển hàng',
      dataIndex: 'transfer_date',
      key: 'transfer_date',
      render: (date) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || 'default'}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      render: (_text, record) => {
        const isCompleted = record.status === 'COMPLETED';
        const isExported = record.status === 'EXPORTED';
        const isPending = record.status === 'PENDING';
        const isPrepared = record.status === 'PREPARED';
        const isExpired = record.status === 'EXPIRED';
        const hasTransferDetails = Array.isArray(record.transferDetails) && record.transferDetails.length > 0;

        return (
          <Space size="middle">
            {isExpired ? (
              <Tooltip title="Xem file xuất kho">
                <FileDoneOutlined
                  style={{ color: '#F77E02', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedTransfer(record);
                    setOpenExportModal(true);
                  }}
                />
              </Tooltip>
            ) : (
              <>
                <Tooltip title="Xem file xuất kho">
                  <FileDoneOutlined
                    style={{ color: '#F77E02', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedTransfer(record);
                      setOpenExportModal(true);
                    }}
                  />
                </Tooltip>
                <Tooltip title="Xem chi tiết sản phẩm">
                  <AppstoreAddOutlined
                    style={{ color: '#1890ff', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedTransfer(record);
                      setOpenDetail(true);
                    }}
                  />
                </Tooltip>
                <Tooltip title="Chỉnh sửa">
                  <EditOutlined
                    style={{ color: '#1890ff', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedTransfer(record);
                      setOpenUpdate(true);
                    }}
                  />
                </Tooltip>

                {isPending && currentUser?.role === 'superadmin' && hasTransferDetails && (
                  <Tooltip title="Xuất kho">
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleMarkExported(record)}
                    >
                      Xuất kho
                    </Button>
                  </Tooltip>
                )}

                {isExported && currentUser?.role === 'admin' && (
                  <Tooltip title="Đã gửi hàng">
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleMarkPrepared(record)}
                    >
                      Đã gửi hàng
                    </Button>
                  </Tooltip>
                )}

                {(isPrepared || isExported) && currentUser?.role === 'superadmin' && (
                  <Tooltip title="Hoàn thành">
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleMarkCompleted(record)}
                    >
                      Hoàn thành
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
          </Space>
        );
      }
    },
  ];

  const handleSearch = () => {
    setPage(1);
    setSearch(inputValue);
  };

  return (
    <div>
      {/* Bộ lọc thời gian */}
      <Card 
        title={
          <span className="flex items-center">
            <FilterOutlined className="mr-2" />
            Bộ lọc theo thời gian
          </span>
        }
        bordered={false}
        className="shadow-sm mb-6"
      >
        <Row gutter={[16, 16]}>
          {/* Tìm kiếm text */}
          <Col xs={24} md={12}>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm kiếm theo mã đơn hàng, khách hàng..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleSearch}
                className="w-full"
                allowClear
                suffix={
                  <SearchOutlined 
                    onClick={handleSearch}
                    className="cursor-pointer text-gray-400"
                  />
                }
              />
            </div>
          </Col>
          
          {/* Date Range Picker */}
          <Col xs={24} md={12}>
            {mounted ? (
              <div className="flex gap-2">
                <RangePicker
                  onChange={handleDateChange}
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  placeholder={['Từ ngày', 'Đến ngày']}
                />
                {(startDate || endDate) && (
                  <Button 
                    onClick={handleResetDateFilter}
                    icon={<ReloadOutlined />}
                  >
                    Xóa
                  </Button>
                )}
              </div>
            ) : (
              <div style={{ height: 32, backgroundColor: '#f0f0f0', borderRadius: 6 }}></div>
            )}
          </Col>

          {/* Thông tin filter */}
          <Col xs={24}>
            <div className="text-sm text-gray-600">
              {transfersData?.total !== undefined && (
                <>
                  Tìm thấy {transfersData.total} đơn hàng
                  {startDate && endDate && ` từ ${startDate} đến ${endDate}`}
                  {search && ` • Tìm kiếm: "${search}"`}
                </>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Action bar */}
      <div className="flex items-center justify-between mb-4 mt-4">
        <div className="text-lg font-semibold">
          Danh sách mã đơn hàng
        </div>
        <Button type="primary" onClick={() => setOpenCreate(true)}>
          Thêm mã đơn hàng
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={transfersData?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: transfersData?.total || 0,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showTotal: (total) => `Tổng ${total} đơn hàng`,
        }}
      />

      {/* Modals */}
      <TransferCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <TransferUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        transferData={selectedTransfer}
        refetch={refetch}
      />

      <TransferDetailModal
        visible={openDetail}
        transferId={selectedTransfer?.id || 0}
        transferData={selectedTransfer}
        onClose={() => setOpenDetail(false)}
        refetchTransfer={refetch}
        status={selectedTransfer?.status || 'PENDING'}
      />

      <TransferFileExport
        visible={openExportModal}
        transferId={selectedTransfer?.id || 0}
        transferData={selectedTransfer}
        onClose={() => setOpenExportModal(false)}
      />
    </div>
  );
}