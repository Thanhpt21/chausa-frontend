'use client';

import { Modal, Table, Button, Spin, notification, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';
import { useOverExportedProducts } from '@/hooks/product/useOverExportedProducts';
import { formatVND } from '@/utils/helpers';

interface OverExportedProductModalProps {
  open: boolean;
  onClose: () => void;
}

export const OverExportedProductModal = ({
  open,
  onClose,
}: OverExportedProductModalProps) => {
  const { data, isLoading, isError } = useOverExportedProducts();
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
        filename: 'San_pham_am_ton_kho.pdf',
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

  // Định nghĩa cột
  const columns: ColumnsType<any> = [
    {
      title: 'STT',
      render: (_text, _record, index) => index + 1,
      width: 50,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'title',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
    },
    {
      title: 'Màu sắc bị âm',
      dataIndex: 'negativeStockColors',
      render: (colors: any[]) => (
        <div>
          {colors.map((color, idx) => (
            <div key={idx} className="mb-1">
              <Tag color="red">{color.colorTitle}</Tag> 
              Nhập: {color.importedQuantity} | 
              Xuất: {color.exportedAndTransferredQuantity} | 
              Tồn kho: <strong style={{ color: 'red' }}>{color.remainingQuantity}</strong>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Danh sách sản phẩm xuất vượt tồn kho"
      width={1000}
      style={{ top: 20 }}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button key="pdf" type="primary" onClick={handleExportToPDF}>
          Tải PDF
        </Button>,
      ]}
    >
      <div ref={contentRef}>
        <div className="px-5 text-sm">
          <div><strong>CHÂU SA</strong></div>
        </div>

        <div className="text-center font-semibold mt-5 mb-3">
          DANH SÁCH SẢN PHẨM BỊ ÂM TỒN KHO
        </div>

        <div className="px-5">
          {isLoading ? (
            <Spin />
          ) : isError ? (
            <div>Đã xảy ra lỗi khi tải dữ liệu.</div>
          ) : data?.data.length === 0 ? (
            <div>Không có sản phẩm nào bị âm tồn kho.</div>
          ) : (
            <Table
              dataSource={data?.data}
              columns={columns}
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
