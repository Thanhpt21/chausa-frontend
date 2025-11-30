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
} from '@ant-design/icons';
import { useState } from 'react';

import { useProjectCategories } from '@/hooks/project-category/useProjectCategories';
import { useDeleteProjectCategory } from '@/hooks/project-category/useDeleteProjectCategory';
import { ProjectCategory } from '@/types/project-category.type'; // đảm bảo import type
// import { ProjectCategoryCreateModal } from './ProjectCategoryCreateModal';
// import { ProjectCategoryUpdateModal } from './ProjectCategoryUpdateModal';
import { formatDate } from '@/utils/helpers';
import { ProjectCategoryCreateModal } from './ProjectCategoryCreateModal';
import { ProjectCategoryUpdateModal } from './ProjectCategoryUpdateModal';

export default function ProjectCategoryTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | null>(null);

  const { data, isLoading, refetch } = useProjectCategories({ page, limit: 10, search });
  const { mutateAsync: deleteProjectCategory } = useDeleteProjectCategory();

  const columns: ColumnsType<ProjectCategory> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên hạng mục',
      dataIndex: 'title',
      key: 'title',
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
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedCategory(record);
                setOpenUpdate(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá hạng mục dự án',
                  content: `Bạn có chắc chắn muốn xoá "${record.title}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteProjectCategory(record.id);
                      message.success('Xoá hạng mục dự án thành công');
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
            placeholder="Tìm kiếm hạng mục dự án..."
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
          Thêm hạng mục dự án
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

      <ProjectCategoryCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <ProjectCategoryUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        category={selectedCategory}
        refetch={refetch}
      />
    </div>
  );
}
