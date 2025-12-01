'use client';

import { Modal, Table, Button, Spin, notification } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAllCustomers } from '@/hooks/customer/useAllCustomers';
import { Customer } from '@/types/customer.type';
import { formatDate } from '@/utils/helpers';
import { useEffect, useRef, useState } from 'react';

interface CustomerListModalProps {
  open: boolean;
  onClose: () => void;
}

export const CustomerListModal = ({ open, onClose }: CustomerListModalProps) => {
  const { data, isLoading } = useAllCustomers({});
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [html2pdf, setHtml2pdf] = useState<any>(null);

  useEffect(() => {
    import('html2pdf.js')
      .then((module) => setHtml2pdf(() => module.default))
      .catch((error) => {
        console.error("Failed to load html2pdf.js:", error);
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
        filename: `Danh_sach_khach_hang.pdf`,
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

  const columns: ColumnsType<Customer> = [
    {
      title: 'Stt',
      key: 'index',
      width: 20, // You can adjust the width as needed
      render: (_text, _record, index) => index + 1, // This will render the index + 1
    },
    { title: 'Tên khách hàng', dataIndex: 'name', key: 'name' },
    { title: 'Số điện thoại', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    { title: 'MST', dataIndex: 'mst', key: 'mst' },
    { title: 'Điểm thành viên', dataIndex: 'loyaltyPoint', key: 'loyaltyPoint' },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => formatDate(createdAt),
    },
  ];

  return (
    <Modal
      title="Danh sách tất cả khách hàng"
      open={open}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Đóng
        </Button>,
        <Button key="export" type="primary" onClick={handleExportToPDF} disabled={!html2pdf}>
          Tải PDF
        </Button>,
      ]}
      style={{ top: 20 }}
    >
      <div ref={contentRef}>
        <div className="px-5 text-sm">
          <div><strong>CHÂU SA</strong></div>
        </div>

        <div className="px-5 mt-5 text-center text-base">
          <strong>DANH SÁCH TẤT CẢ KHÁCH HÀNG</strong>
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
