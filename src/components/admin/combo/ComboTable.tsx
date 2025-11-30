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
  AppstoreAddOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

import { useCombos } from '@/hooks/combo/useCombos';
import { useDeleteCombo } from '@/hooks/combo/useDeleteCombo';
import { Combo } from '@/types/combo.type';
import { formatDate } from '@/utils/helpers';
import { ComboCreateModal } from './ComboCreateModal';
import { ComboUpdateModal } from './ComboUpdateModal';
import { ComboAddProductModal } from './ComboAddProductModal';

export default function ComboTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [openAddProduct, setOpenAddProduct] = useState(false);

  const { data, isLoading, refetch } = useCombos({ page, limit: 10, search });
  const { mutateAsync: deleteCombo } = useDeleteCombo();

  const handleOpenAddProduct = (combo: Combo) => {
    setSelectedCombo(combo);
    setOpenAddProduct(true);
  };

  const columns: ColumnsType<Combo> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên combo',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => formatDate(createdAt),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_text, record) => (
        <Space size="middle">
          <Tooltip title="Thêm sản phẩm vào combo">
            <AppstoreAddOutlined
              style={{ color: '#52c41a', cursor: 'pointer' }}
              onClick={() => handleOpenAddProduct(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedCombo(record);
                setOpenUpdate(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá combo',
                  content: `Bạn có chắc chắn muốn xoá "${record.title}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteCombo(record.id);
                      message.success('Xoá combo thành công');
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
            placeholder="Tìm kiếm combo..."
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
          Thêm combo
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

      {/* Chỉ render modal khi có combo được chọn */}
      {selectedCombo && (
        <ComboAddProductModal
          open={openAddProduct}
          onClose={() => setOpenAddProduct(false)}
          combo={selectedCombo}
          refetch={refetch}
        />
      )}

      <ComboCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      {selectedCombo && (
        <ComboUpdateModal
          open={openUpdate}
          onClose={() => setOpenUpdate(false)}
          combo={selectedCombo}
          refetch={refetch}
        />
      )}
    </div>
  );
}
