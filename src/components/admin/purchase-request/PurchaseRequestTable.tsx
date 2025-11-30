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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  AppstoreAddOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

// --- Thay đổi import hook và type cho Purchase ---

import { PurchaseRequest, PurchaseRequestStatus } from '@/types/purchase-request.type';


import { formatDate, formatVND } from '@/utils/helpers';
import { useAllSuppliers } from '@/hooks/supplier/useAllSuppliers';
import { useAuth } from '@/context/AuthContext';
import { useUpdatePurchaseRequestStatus } from '@/hooks/purchase/useUpdatePurchaseRequestStatus';
import { usePurchaseRequests } from '@/hooks/purchase/usePurchaseRequests';
import { useDeletePurchaseRequest } from '@/hooks/purchase/useDeletePurchaseRequest';
import PurchaseCreateModal from './PurchaseCreateModal';
import { PurchaseUpdateModal } from './PurchaseUpdateModal';
import PurchaseRequestDetailModal from './PurchaseRequestDetail';
import PurchaseRequestFileExport from './PurchaseRequestFileExport';


const statusColors: Record<string, string> = {
  PENDING: 'orange',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
};

export default function PurchaseRequestTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRequest | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDetailImport, setOpenDetailImport] = useState(false);
  const [selectedPurchasePDF, setSelectedPurchasePDF] = useState<PurchaseRequest | null>(null);

  const { data, isLoading, refetch } = usePurchaseRequests({ page, limit: 10, search });
  const { mutateAsync: deletePurchase } = useDeletePurchaseRequest();
  const { mutateAsync: updatePurchaseStatus } = useUpdatePurchaseRequestStatus();

  const { data: suppliers } = useAllSuppliers({});
  const { currentUser, isLoading: authLoading } = useAuth();

  const supplierMap = suppliers?.reduce((acc: Record<number, string>, supplier) => {
    acc[supplier.id] = supplier.name;
    return acc;
  }, {}) || {};

  const handleCompletePurchase = (record: PurchaseRequest) => {
    Modal.confirm({
      title: 'Xác nhận phiếu mua',
      content: `Bạn có chắc chắn muốn xác nhận phiếu mua này đã "Hoàn thành"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await updatePurchaseStatus({
            id: record.id,
            status: 'COMPLETED' as PurchaseRequestStatus,
          });
          message.success('Xác nhận phiếu mua thành công!');
          refetch();
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Lỗi khi xác nhận phiếu mua');
        }
      },
    });
  };

  const columns: ColumnsType<PurchaseRequest> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplierId',
      key: 'supplierId',
      render: (supplierId) => supplierMap[supplierId] || '-',
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
      title: 'Người tạo',
      dataIndex: ['user', 'name'],
      key: 'userName',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => formatVND(amount) || '-',
    },
    {
      title: 'Ngày tạo phiếu',
      dataIndex: 'purchase_date', // Giả sử trường ngày tạo phiếu purchase là purchaseDate
      key: 'purchase_date',
      render: (purchaseDate) => formatDate(purchaseDate),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_text, record) => {
        const isCompleted = record.status === 'COMPLETED';
        const isPending = record.status === 'PENDING';

        return (
          <Space size="middle">
            <Tooltip title="Xem phiếu mua">
              <FileDoneOutlined
                style={{ color: '#F77E02', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedPurchasePDF(record);
                  setOpenDetailImport(true);
                }}
              />
            </Tooltip>

            <Tooltip title="Xem sản phẩm phiếu mua">
              <AppstoreAddOutlined
                style={{ color: '#52c41a', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedPurchase(record);
                  setOpenDetail(true);
                }}
              />
            </Tooltip>

            {(!isCompleted || currentUser?.role === 'superadmin') && (
              <Tooltip title="Chỉnh sửa">
                <EditOutlined
                  style={{ color: '#1890ff', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedPurchase(record);
                    setOpenUpdate(true);
                  }}
                />
              </Tooltip>
            )}

            {currentUser?.role === 'superadmin' && !isCompleted && (
              <Tooltip title="Xoá">
                <DeleteOutlined
                  style={{ color: 'red', cursor: 'pointer' }}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Xác nhận xoá phiếu mua',
                      content: `Bạn có chắc chắn muốn xoá phiếu mua này không?`,
                      okText: 'Xoá',
                      okType: 'danger',
                      cancelText: 'Hủy',
                      onOk: async () => {
                        try {
                          await deletePurchase(record.id);
                          message.success('Xoá phiếu mua thành công');
                          refetch();
                        } catch (error: any) {
                          message.error(error?.response?.data?.message || 'Xoá thất bại');
                        }
                      },
                    });
                  }}
                />
              </Tooltip>
            )}

            {isPending &&
                currentUser?.role === 'superadmin' && Array.isArray(record.details) &&
                record.details?.length > 0 && (
                    <Tooltip title="Xác nhận phiếu mua">
                    <Button
                        size="small"
                        type="primary"
                        onClick={() => handleCompletePurchase(record)}
                    >
                        Xác nhận
                    </Button>
                    </Tooltip>
                )}
          </Space>
        );
      },
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
            placeholder="Tìm kiếm phiếu mua..."
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
          Thêm phiếu mua
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

      <PurchaseRequestDetailModal
        visible={openDetail}
        purchaseId={selectedPurchase?.id || 0}
        refetchPurchase={refetch}
        onClose={() => setOpenDetail(false)}
        status={selectedPurchase?.status || 'PENDING'}
      />

      <PurchaseRequestFileExport
        visible={openDetailImport}
        purchaseRequestId={selectedPurchasePDF?.id || 0}
        purchaseRequestData={selectedPurchasePDF}
        onClose={() => setOpenDetailImport(false)}
      />

      <PurchaseCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <PurchaseUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        purchaseData={selectedPurchase}
        refetch={refetch}
      />
    </div>
  );
}
