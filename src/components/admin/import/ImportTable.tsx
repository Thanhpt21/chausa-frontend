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

import { useImports } from '@/hooks/import/useImports';
import { useDeleteImport } from '@/hooks/import/useDeleteImport';
import { Import, ImportStatus } from '@/types/import.type'; // định nghĩa type Import tương ứng
import ImportDetailModal from './ImportDetailModal';
import { formatDate, formatVND } from '@/utils/helpers';
import { ImportCreateModal } from './ImportCreateModal';
import { ImportUpdateModal } from './ImportUpdateModal';
import { useAllSuppliers } from '@/hooks/supplier/useAllSuppliers';
import { useAuth } from '@/context/AuthContext';
import { useUpdateImportStatus } from '@/hooks/import/useUpdateImportStatus';
import ImportFileImport from './ImportFileImport';

const statusColors: Record<string, string> = {
  PENDING: 'orange',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  COMPLETED: 'Đã nhập kho',
  CANCELLED: 'Đã huỷ',
};

export default function ImportTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedImport, setSelectedImport] = useState<any>(null); // Để lưu import được chọn
  const [openDetail, setOpenDetail] = useState(false); // Trạng thái mở modal chi tiết
  const [openDetailImport, setOpenDetailImport] = useState(false);
  const [selectedImportPDF, setSelectedImportPDF] = useState<Import | null>(null);

  const { data, isLoading, refetch } = useImports({ page, limit: 10, search });
  const { mutateAsync: deleteImport } = useDeleteImport();

  const { mutateAsync: updateImportStatus } = useUpdateImportStatus();

  // Lấy danh sách nhà cung cấp
  const { data: suppliers } = useAllSuppliers({});

  // Lấy thông tin người dùng (ví dụ như role)
  const { currentUser, isLoading: authLoading } = useAuth(); // Lấy thông tin người dùng


  // Tạo một map cho các nhà cung cấp để dễ dàng tra cứu tên nhà cung cấp theo `supplierId`
  const supplierMap = suppliers?.reduce((acc: Record<number, string>, supplier) => {
    acc[supplier.id] = supplier.name;
    return acc;
  }, {}) || {}; // Nếu suppliers không có dữ liệu, supplierMap sẽ là một đối tượng rỗng

  const handleCompleteImport = (record: Import) => {
    Modal.confirm({
      title: 'Xác nhận nhập kho',
      content: `Bạn có chắc chắn muốn xác nhận phiếu nhập này đã "Hoàn thành" và cập nhật tồn kho?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await updateImportStatus({
            id: record.id,
            status: 'COMPLETED' as ImportStatus,
          });
          message.success('Nhập kho thành công!');
          refetch();
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Lỗi khi nhập kho');
        }
      },
      onCancel: () => {
        // Do nothing or add a message if needed when cancelled
      },
    });
  };

  const columns: ColumnsType<Import> = [
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
      render: (supplierId) => supplierMap[supplierId] || '-', // Hiển thị tên nhà cung cấp
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
      title: 'Loại phiếu nhập',
      dataIndex: 'isInternal',
      key: 'isInternal',
      render: (isInternal) => (
      <Tag color={isInternal ? 'purple' : 'blue'}>
        {isInternal ? 'Nhập kho đổi trả hàng' : 'Nhập kho từ nhà cung cấp'}
      </Tag>
      ),
    },
    {
      title: 'Chi phí phát sinh',
      dataIndex: 'extra_cost',
      key: 'extra_cost',
      render: (cost) => cost !== undefined && cost !== null ? formatVND(cost) : '-', // Hiển thị chi phí nếu có, nếu không '-' 
    },
    {
      title: 'Ngày nhập kho',
      dataIndex: 'import_date',
      key: 'import_date',
      render: (import_date) => {
        return formatDate(import_date);
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_text, record) => {
        // Kiểm tra trạng thái của phiếu nhập
        const isCompleted = record.status === 'COMPLETED';
        const isPending = record.status === 'PENDING';
        return (
          <Space size="middle">

             <Tooltip title="Xem phiếu nhập kho">
            <FileDoneOutlined
              style={{ color: '#F77E02', cursor: 'pointer' }}
              onClick={() => {
                setSelectedImportPDF(record);
                setOpenDetailImport(true);
              }}
            />
          </Tooltip>

            <Tooltip title="Xem sản phẩm phiếu nhập kho">
              <AppstoreAddOutlined
                style={{ color: '#52c41a', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedImport(record);
                  setOpenDetail(true); // Mở modal chi tiết
                }}
              />
            </Tooltip>

            {/* Chỉ hiển thị icon chỉnh sửa nếu status không phải là 'COMPLETED' VÀ người dùng là 'superadmin' 
                HOẶC nếu status là PENDING (cho phép admin/user chỉnh sửa ban đầu) */}
            {(!isCompleted || currentUser?.role === 'superadmin') && (
              <Tooltip title="Chỉnh sửa">
                <EditOutlined
                  style={{ color: '#1890ff', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedImport(record);
                    setOpenUpdate(true);
                  }}
                />
              </Tooltip>
            )}

            {/* CẢI TIẾN ĐIỀU KIỆN 🚀: Chỉ hiển thị icon xoá NẾU người dùng là 'superadmin' */}
            {currentUser?.role === 'superadmin' && !isCompleted && ( // <-- Thay đổi điều kiện ở đây
              <Tooltip title="Xoá">
                <DeleteOutlined
                  style={{ color: 'red', cursor: 'pointer' }}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Xác nhận xoá phiếu nhập',
                      content: `Bạn có chắc chắn muốn xoá phiếu nhập này không?`,
                      okText: 'Xoá',
                      okType: 'danger',
                      cancelText: 'Hủy',
                      onOk: async () => {
                        try {
                          await deleteImport(record.id);
                          message.success('Xoá phiếu nhập thành công');
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

            {isPending && currentUser?.role === 'superadmin' && (
              <Tooltip title="Nhập kho">
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleCompleteImport(record)}
                >
                  Nhập kho
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    }
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
            placeholder="Tìm kiếm phiếu nhập..."
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
          Thêm phiếu nhập
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

      <ImportDetailModal
        visible={openDetail}
        importId={selectedImport?.id || 0}
        refetchImport={refetch}
        onClose={() => setOpenDetail(false)}
        status={selectedImport?.status || 'PENDING'}
      />

      <ImportFileImport
        visible={openDetailImport}
        importId={selectedImportPDF?.id || 0}
        importData={selectedImportPDF}
        onClose={() => setOpenDetailImport(false)}
      />

      <ImportCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <ImportUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        importData={selectedImport}
        refetch={refetch}
      />
    </div>
  );
}