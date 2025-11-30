'use client';

import { Modal, Table, Button, Spin, notification } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { formatVND } from '@/utils/helpers';
import { Product } from '@/types/product.type';

interface ProductListModalProps {
  open: boolean;
  onClose: () => void;
}

export const ProductListModal = ({ open, onClose }: ProductListModalProps) => {
  const { data, isLoading } = useAllProducts({});
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [html2pdf, setHtml2pdf] = useState<any>(null);


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

  // Định nghĩa table
  const columns: ColumnsType<Product> = [
     {
      title: 'Stt',
      key: 'index',
      width: 20, // You can adjust the width as needed
      render: (_text, _record, index) => index + 1, // This will render the index + 1
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Model (SKU)',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatVND(price),
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Tổng nhập',
      dataIndex: 'totalImported',
      key: 'totalImported',
    },
    {
      title: 'Tổng xuất',
      dataIndex: 'totalExportedAndTransferred',
      key: 'totalExportedAndTransferred',
    },
    {
      title: 'Tồn kho',
      dataIndex: 'totalRemaining',
      key: 'totalRemaining',
    },
    {
      title: 'Tồn kho theo màu',
      dataIndex: 'stockByColor',
      key: 'stockByColor',
      render: (_, record) => (
        <div>
          {record.stockByColor?.map((item) => (
            <div key={item.colorTitle}>
              <strong>{item.colorTitle}:</strong>Tồn: {item.remainingQuantity}
              {' '}( Nhập: {item.importedQuantity}  - Xuất: {item.exportedAndTransferredQuantity} )
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="Danh sách Kho hàng"
      open={open}
      onCancel={onClose}
      width={1300}
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
          <div><strong>CÔNG TY TNHH GIẢI PHÁP KỸ THUẬT EIT</strong></div>
          <div><strong>Địa chỉ:</strong> 37 Nguyễn Văn Huyên, Phú Thọ Hoà, TP.HCM</div>
          <div><strong>Website:</strong> www.eitsmart.com.vn</div>
        </div>

        <div className="px-5 mt-5 text-center text-base">
          <strong>DANH SÁCH KHO HÀNG</strong>
        </div>

        <div className="px-5 mt-5 overflow-x-auto">
          {isLoading ? (
            <Spin />
          ) : (
            <Table
              columns={columns}
              dataSource={data || []}
              rowKey="id"
              pagination={false}
              bordered
              size="middle"
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
