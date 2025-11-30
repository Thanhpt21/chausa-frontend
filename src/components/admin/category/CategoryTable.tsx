'use client';

import {
  Table,
  Tag,
  Image,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
  Spin,
  Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useState, useMemo } from 'react';

import { CategoryCreateModal } from './CategoryCreateModal';
import { CategoryUpdateModal } from './CategoryUpdateModal';
import { useAllCategories } from '@/hooks/category/useAllCategories';
import { useDeleteCategory } from '@/hooks/category/useDeleteCategory';
import { Category } from '@/types/category.type';

export default function CategoryTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]); // State to manage expanded rows

  const { data: categoriesData, isLoading, refetch } = useAllCategories();
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  // Helper function to build a tree structure from a flat list of categories
  const buildCategoryTree = (data: Category[], parentId: number | null = null): (Category & { children?: Category[] })[] => {
    return data
      .filter((category) => category.parentId === parentId)
      .map((category) => ({
        ...category,
        children: buildCategoryTree(data, category.id),
      }));
  };

  // Create the category tree from fetched data. Only top-level categories form the root.
  const categoriesTree = useMemo(() => {
    if (!categoriesData) return [];
    const tree = buildCategoryTree(categoriesData, null);
    return tree;
  }, [categoriesData]);

  // Function to handle row expansion/collapse when title is clicked
  const handleExpand = (record: Category & { children?: Category[] }) => {
    const key = record.id;
    if (expandedRowKeys.includes(key)) {
      setExpandedRowKeys(expandedRowKeys.filter((k) => k !== key)); // Collapse
    } else {
      setExpandedRowKeys([...expandedRowKeys, key]); // Expand
    }
  };

  const columns: ColumnsType<Category & { children?: Category[] }> = [
      {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, record, index) => {
        // Chỉ hiển thị STT nếu là danh mục gốc (không có parent)
        if (record.parentId === null) {
          return (page - 1) * 10 + index + 1;
        }
        return null;
      },
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record) => {
        // Check if the category has children to determine if it should be clickable
        const hasChildren = record.children && record.children.length > 0;
        return hasChildren ? (
          <Typography.Link
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event if any
              handleExpand(record);
            }}
            style={{ cursor: 'pointer' }}
          >
            {text}
          </Typography.Link>
        ) : (
          text
        );
      },
    },
    {
      title: 'Danh mục cha',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId: number | null) => {
        if (parentId === null) {
          return <Tag color="blue">Danh mục gốc</Tag>;
        }
        const parentCategory = categoriesData?.find((cat: Category) => cat.id === parentId);
        return parentCategory ? parentCategory.title : 'Không xác định';
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
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
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá danh mục',
                  content: `Bạn có chắc chắn muốn xoá danh mục "${record.title}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteCategory(record.id);
                      message.success('Xoá danh mục thành công');
                      refetch?.();
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

  // Filter the tree data for display based on search input
  const filteredCategoriesTree = useMemo(() => {
    if (!search || !categoriesData) {
      return categoriesTree;
    }
    const lowerCaseSearch = search.toLowerCase();

    const filterNodes = (nodes: (Category & { children?: Category[] })[]): (Category & { children?: Category[] })[] => {
      return nodes.filter(node => {
        const matches = 
          node.title.toLowerCase().includes(lowerCaseSearch) ||
          node.slug.toLowerCase().includes(lowerCaseSearch);
        
        let filteredChildren: (Category & { children?: Category[] })[] | undefined;
        if (node.children && node.children.length > 0) {
          filteredChildren = filterNodes(node.children);
        }

        if (matches || (filteredChildren && filteredChildren.length > 0)) {
          // If a parent matches or has matching children, ensure its children are included
          return { ...node, children: filteredChildren || [] };
        }
        return false;
      }).map(node => ({ ...node }));
    };
    const filtered = filterNodes(categoriesTree);
    return filtered;
  }, [categoriesTree, search, categoriesData]);


  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm danh mục..."
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
          <PlusOutlined /> Tạo mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredCategoriesTree}
        rowKey="id"
        loading={isLoading || isDeleting}
        pagination={{
          total: categoriesData?.length,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
        }}
        expandable={{ 
          childrenColumnName: 'children',
          // Use a custom expandIcon render function to hide the default +/- button
          expandIcon: () => null, 
          // Control expanded rows via state
          expandedRowKeys: expandedRowKeys,
          // This onExpand is usually triggered by the default icon, but still useful
          // if we decide to add other expansion triggers.
          onExpand: (expanded, record) => {
            if (expanded) {
              setExpandedRowKeys((prev) => [...prev, record.id]);
            } else {
              setExpandedRowKeys((prev) => prev.filter((key) => key !== record.id));
            }
          },
          // Ant Design will automatically indent based on childrenColumnName
          // and manage the internal tree structure for expanded rows.
          // We rely on our `handleExpand` on the title for user interaction.
        }}
      />

      <CategoryCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
        allCategories={categoriesData || []}
      />

      <CategoryUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        category={selectedCategory}
        refetch={refetch}
        allCategories={categoriesData || []}
      />
    </div>
  );
}
