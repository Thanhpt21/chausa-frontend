'use client';

import { Modal, Table, Button, Spin, notification } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { useColorQuantityByProductId } from '@/hooks/product/useColorQuantityByProductId';
import { formatVND } from '@/utils/helpers';
import { Product } from '@/types/product.type';

interface ProductListModalProps {
  open: boolean;
  onClose: () => void;
}

interface StockByColorItem {
  colorTitle: string;
  importedQuantity: number;
  exportedAndTransferredQuantity: number;
  remainingQuantity: number;
  size: string;
}

export const ProductListModal = ({ open, onClose }: ProductListModalProps) => {
  const { data, isLoading } = useAllProducts({});
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [html2pdf, setHtml2pdf] = useState<any>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    import('html2pdf.js')
      .then((module) => setHtml2pdf(() => module.default))
      .catch((error) => {
        console.error('Failed to load html2pdf.js:', error);
        notification.error({
          message: 'Lỗi tải thư viện',
          description: 'Không thể tải thư viện xuất PDF. Vui lòng thử lại.',
        });
      });
  }, []);

  const handleExportToPDF = () => {
    if (contentRef.current && html2pdf) {
      const options = {
        margin: 10,
        filename: 'Danh_sach_san_pham.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      };

      html2pdf()
        .from(contentRef.current)
        .set(options)
        .save();
    } else {
      notification.warn({
        message: 'Thư viện chưa sẵn sàng',
        description: 'Vui lòng chờ một chút để thư viện xuất PDF được tải.',
      });
    }
  };

  // Custom hook để lấy chi tiết tồn kho theo productId
  const useProductStockDetail = (productId: number) => {
    const { data: stockData, isLoading: stockLoading } = useColorQuantityByProductId(productId);
    
    // Nhóm dữ liệu theo màu và size
    const groupedByColor = stockData?.data?.reduce((acc: { [key: string]: StockByColorItem[] }, item) => {
      if (!acc[item.colorTitle]) {
        acc[item.colorTitle] = [];
      }
      acc[item.colorTitle].push({
        colorTitle: item.colorTitle,
        importedQuantity: item.importedQuantity,
        exportedAndTransferredQuantity: item.exportedAndTransferredQuantity,
        remainingQuantity: item.remainingQuantity,
        size: item.size
      });
      return acc;
    }, {}) || {};

    return {
      stockData: groupedByColor,
      isLoading: stockLoading
    };
  };

  // Component cho expanded row
  const ExpandedRowRender = (product: Product) => {
    const { stockData, isLoading } = useProductStockDetail(product.id);

    if (isLoading) {
      return <Spin size="small" />;
    }

    if (!stockData || Object.keys(stockData).length === 0) {
      return <div className="text-gray-500">Không có thông tin tồn kho chi tiết</div>;
    }

    return (
      <div className="p-4 bg-gray-50 rounded">
        <div className="mb-4">
          <strong className="text-blue-600">Chi tiết tồn kho theo màu và size:</strong>
        </div>
        {Object.entries(stockData).map(([colorTitle, items]) => (
          <div key={colorTitle} className="mb-4 last:mb-0">
            <div className="font-semibold text-green-700 mb-2">
              🎨 Màu: {colorTitle}
            </div>
            <div className="ml-4">
              <Table
                size="small"
                pagination={false}
                dataSource={items.map((item, index) => ({
                  ...item,
                  key: `${colorTitle}-${item.size}-${index}`
                }))}
                columns={[
                  {
                    title: 'Size',
                    dataIndex: 'size',
                    key: 'size',
                    width: 80,
                    render: (size) => <span className="font-medium">{size || 'N/A'}</span>
                  },
                  {
                    title: 'Đã nhập',
                    dataIndex: 'importedQuantity',
                    key: 'importedQuantity',
                    width: 100,
                    align: 'center' as const,
                    render: (quantity) => (
                      <span className={quantity > 0 ? 'text-blue-600' : 'text-gray-400'}>
                        {quantity}
                      </span>
                    )
                  },
                  {
                    title: 'Đã xuất',
                    dataIndex: 'exportedAndTransferredQuantity',
                    key: 'exportedAndTransferredQuantity',
                    width: 100,
                    align: 'center' as const,
                    render: (quantity) => (
                      <span className={quantity > 0 ? 'text-orange-600' : 'text-gray-400'}>
                        {quantity}
                      </span>
                    )
                  },
                  {
                    title: 'Tồn kho',
                    dataIndex: 'remainingQuantity',
                    key: 'remainingQuantity',
                    width: 100,
                    align: 'center' as const,
                    render: (quantity) => (
                      <span className={
                        quantity > 0 ? 'text-green-600 font-semibold' : 
                        quantity === 0 ? 'text-yellow-600' : 'text-red-600'
                      }>
                        {quantity}
                      </span>
                    )
                  },
                  {
                    title: 'Tình trạng',
                    key: 'status',
                    width: 120,
                    align: 'center' as const,
                    render: (_, record) => {
                      const remaining = record.remainingQuantity ?? 0;
                      return (
                        <span className={
                          remaining > 0 ? 'text-green-600' : 
                          remaining === 0 ? 'text-yellow-600' : 'text-red-600'
                        }>
                          {remaining > 0 ? 'Còn hàng' : 
                           remaining === 0 ? 'Hết hàng' : 'Âm kho'}
                        </span>
                      );
                    }
                  }
                ]}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Định nghĩa table columns
  const columns: ColumnsType<Product> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center' as const,
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Model (SKU)',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'right' as const,
      render: (price: number) => formatVND(price),
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Tổng nhập',
      dataIndex: 'totalImported',
      key: 'totalImported',
      width: 100,
      align: 'center' as const,
      render: (quantity: number | undefined) => (
        <span className={(quantity ?? 0) > 0 ? 'text-blue-600' : 'text-gray-400'}>
          {quantity ?? 0}
        </span>
      ),
    },
    {
      title: 'Tổng xuất',
      dataIndex: 'totalExportedAndTransferred',
      key: 'totalExportedAndTransferred',
      width: 100,
      align: 'center' as const,
      render: (quantity: number | undefined) => (
        <span className={(quantity ?? 0) > 0 ? 'text-orange-600' : 'text-gray-400'}>
          {quantity ?? 0}
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'totalRemaining',
      key: 'totalRemaining',
      width: 100,
      align: 'center' as const,
      render: (quantity: number | undefined) => {
        const qty = quantity ?? 0;
        return (
          <span className={
            qty > 0 ? 'text-green-600 font-semibold' : 
            qty === 0 ? 'text-yellow-600' : 'text-red-600'
          }>
            {qty}
          </span>
        );
      },
    },
    {
      title: 'Tình trạng',
      key: 'status',
      width: 100,
      align: 'center' as const,
      render: (_, record) => {
        const totalRemaining = record.totalRemaining ?? 0;
        return (
          <span className={
            totalRemaining > 0 ? 'text-green-600' : 
            totalRemaining === 0 ? 'text-yellow-600' : 'text-red-600'
          }>
            {totalRemaining > 0 ? 'Còn hàng' : 
             totalRemaining === 0 ? 'Hết hàng' : 'Âm kho'}
          </span>
        );
      },
    },
  ];

  return (
    <Modal
      title="Danh sách Kho hàng"
      open={open}
      onCancel={onClose}
      width={1400}
      style={{ top: 20 }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Đóng
        </Button>,
        <Button key="export" type="primary" onClick={handleExportToPDF}>
          Tải PDF
        </Button>,
      ]}
    >
      <div ref={contentRef}>
        <div className="px-5 text-sm">
          <div><strong>CHÂU SA</strong></div>
        </div>

        <div className="px-5 mt-5 text-center text-base">
          <strong>DANH SÁCH KHO HÀNG</strong>
        </div>

        <div className="px-5 mt-5 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={data || []}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} sản phẩm`,
              }}
              bordered
              size="middle"
              expandable={{
                expandedRowRender: (record) => ExpandedRowRender(record),
                rowExpandable: (record) => true,
                expandedRowKeys,
                onExpandedRowsChange: (expandedKeys) => setExpandedRowKeys(expandedKeys as React.Key[]), // 👈 FIX HERE
                expandIcon: ({ expanded, onExpand, record }) =>
                  expanded ? (
                    <Button type="link" onClick={(e) => onExpand(record, e)}>
                      🔼 Thu gọn
                    </Button>
                  ) : (
                    <Button type="link" onClick={(e) => onExpand(record, e)}>
                      🔽 Xem chi tiết
                    </Button>
                  ),
              }}
              scroll={{ x: 1000 }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};