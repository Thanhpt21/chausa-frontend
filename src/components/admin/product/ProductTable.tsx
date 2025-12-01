'use client';

import {
  Table,
  Image,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Product } from '@/types/product.type';
import { useProducts } from '@/hooks/product/useProducts';
import { useDeleteProduct } from '@/hooks/product/useDeleteProduct';
import { ProductCreateModal } from './ProductCreateModal';
import { ProductUpdateModal } from './ProductUpdateModal';
import { useAllCategories } from '@/hooks/category/useAllCategories';
import { formatVND } from '@/utils/helpers';
import { Category } from '@/types/category.type';
import { InventoryModal } from './InventoryModal';
import { ProductListModal } from './ProductListModal';
import { OverExportedProductModal } from './OverExportedProductModal';

export default function ProductTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>(undefined);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [openListModal, setOpenListModal] = useState(false);
  const [openOverExportedModal, setOpenOverExportedModal] = useState(false);



  const { data, isLoading, refetch } = useProducts({
    page,
    limit: 10,
    search,
    categoryId: filterCategoryId,
  });
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const {
    data: allCategories,
    isLoading: isLoadingCategories,
    error: errorCategories,
  } = useAllCategories();

  const columns: ColumnsType<Product> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'thumb',
      key: 'thumb',
      render: (url: any) => {
        const isValidImage =
          typeof url === 'string' &&
          url.trim() !== '' &&
          url !== 'undefined' &&
          url !== 'null';

        return isValidImage ? (
          <Image
            src={url}
            alt="Thumb"
            width={40}
            height={40}
            style={{ borderRadius: 8, objectFit: 'cover' }}
            preview={true}
          />
        ) : (
          <span>—</span>
        );
      },
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'title',
      key: 'title',
    },
     {
      title: 'Model',
      dataIndex: 'sku',
      key: 'sku',
    },
     {
      title: 'Giá gốc',
      dataIndex: 'price',
      key: 'price',
       render: (price) => formatVND(price) || '-',
    },
      {
      title: 'Giảm giá',
      dataIndex: 'discount',
      key: 'discount',
       render: (discount) => formatVND(discount) || '-',
    },
    {
      title: 'Danh mục',
      key: 'category',
      align: 'center',
      render: (record) => <span>{record.category?.title || '—'}</span>,
    },
     {
        title: 'Mô tả',
        dataIndex: 'description',
        key: 'description',
        render: (desc: string) => (
      <div
        dangerouslySetInnerHTML={{
          __html: `<div style="margin: 0;"><style>p { margin: 0; }</style>${desc || ''}</div>`,
        }}
      />
    )
    },
     {
      title: 'Kho',
      key: 'stock',
      render: (record) => {
        const { stock } = record;
        return (
          <>
            <div><strong>Nhập kho:</strong> {stock?.totalImported || 0}</div>
            <div><strong>Xuất kho:</strong> {stock?.totalExported || 0}</div>
            <div><strong>Tồn kho:</strong> {stock?.remainingQuantity || 0}</div>
          </>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => {
        const hasStock = (record.stock?.remainingQuantity ?? 0) > 0;

        return (
          <Space size="middle">
            <Tooltip title="Xem kho sản phẩm">
              <EyeOutlined
                style={{ color: '#52c41a', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedProductId(record.id);
                  setModalVisible(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <EditOutlined
                style={{ color: '#1890ff', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedProduct(record);
                  setOpenUpdate(true);
                }}
              />
            </Tooltip>
            {!hasStock && (
              <Tooltip title="Xóa">
                <DeleteOutlined
                  style={{ color: 'red', cursor: 'pointer' }}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Xác nhận xoá sản phẩm',
                      content: `Bạn có chắc chắn muốn xoá sản phẩm "${record.title}" không?`,
                      okText: 'Xoá',
                      okType: 'danger',
                      cancelText: 'Hủy',
                      onOk: async () => {
                        try {
                          await deleteProduct(record.id);
                          message.success('Xoá sản phẩm thành công');
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
          </Space>
        );
      },
    }
  ];

  const handleSearch = () => {
    setPage(1);
    setSearch(inputValue);
  };

  const handleCategoryFilterChange = (value: number | undefined) => {
    setFilterCategoryId(value);
    setPage(1);
  };

  useEffect(() => {
    refetch();
  }, [filterCategoryId, refetch]);

  if (isLoading || isLoadingCategories) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (errorCategories) {
    return <div>Lỗi khi tải dữ liệu...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Select
            placeholder="Lọc theo danh mục"
            style={{ width: 200 }}
            loading={isLoadingCategories}
            onChange={handleCategoryFilterChange}
            allowClear
            value={filterCategoryId}
          >
            {allCategories?.map((cat: Category) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.title}
              </Select.Option>
            ))}
          </Select>
          <Input
            placeholder="Tìm kiếm sản phẩm..."
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
        <div className='flex justify-center gap-2'>
            <Button danger onClick={() => setOpenOverExportedModal(true)}>
              Sản phẩm âm kho
            </Button>
            <Button onClick={() => setOpenListModal(true)}>
              Xem tất cả
            </Button>
             <Button type="primary" onClick={() => setOpenCreate(true)}>
              Tạo mới
            </Button>
        </div>
       
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading || isLoadingCategories}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
        }}
      />

      <ProductCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
        categories={allCategories || []}
      />

      <ProductUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        product={selectedProduct}
        refetch={refetch}
        categories={allCategories || []}
      />

       <ProductListModal
          open={openListModal}
          onClose={() => setOpenListModal(false)}
        />

        <OverExportedProductModal
          open={openOverExportedModal}
          onClose={() => setOpenOverExportedModal(false)}
        />

      {selectedProductId !== null && (
        <InventoryModal
          productId={selectedProductId}
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedProductId(null);
          }}
        />
      )}
    </div>
  );
}
