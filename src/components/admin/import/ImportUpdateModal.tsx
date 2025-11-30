'use client';

import { Modal, Form, Input, Button, message, Select, Spin, InputNumber } from 'antd';
import { useEffect, useState } from 'react';
import { useUpdateImport } from '@/hooks/import/useUpdateImport'; // Hook cập nhật phiếu nhập
import { Import } from '@/types/import.type'; // Định nghĩa type của Import
import { useAuth } from '@/context/AuthContext'; // Import useAuth hook
import { useAllSuppliers } from '@/hooks/supplier/useAllSuppliers'; // Hook lấy tất cả nhà cung cấp

interface ImportUpdateModalProps {
  open: boolean;
  onClose: () => void;
  importData: Import | null;
  refetch?: () => void;
}

export const ImportUpdateModal = ({
  open,
  onClose,
  importData,
  refetch,
}: ImportUpdateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useUpdateImport(); // Hook cập nhật phiếu nhập
  const [status, setStatus] = useState<string>('PENDING'); // Trạng thái mặc định
  const [selectedSupplier, setSelectedSupplier] = useState<number | undefined>(undefined); // Supplier ID đã chọn
  const [isInternal, setIsInternal] = useState<boolean>(false);

  // Lấy thông tin người dùng từ AuthContext
  const { currentUser, isLoading: authLoading } = useAuth();

  // Lấy danh sách nhà cung cấp
  const { data: suppliers, isLoading: suppliersLoading, isError } = useAllSuppliers({});

  // Khi modal mở, điền giá trị vào form
  useEffect(() => {
    if (importData && open) {
      form.setFieldsValue({
        note: importData.note,
        status: importData.status,
        supplierId: importData.supplierId,
        extra_cost: importData.extra_cost,
        isInternal: importData.isInternal
      });
      setStatus(importData.status);
      setSelectedSupplier(importData.supplierId);
      setIsInternal(importData.isInternal);
    }
  }, [importData, open, form]);

  // Hàm xử lý khi gửi form
  const onFinish = async (values: any) => {
    try {
      await mutateAsync({
        id: importData?.id!, // Duy trì ID của import cần cập nhật
        data: {
          ...values,
          status, // Sử dụng trạng thái từ state
          supplierId: selectedSupplier, // Sử dụng supplierId từ state
        },
      });
      message.success('Cập nhật phiếu nhập thành công');
      onClose();
      form.resetFields();
      refetch?.(); // Lấy lại dữ liệu sau khi cập nhật
      setIsInternal(false);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật phiếu nhập');
    }
  };

  // Hàm để lấy các tùy chọn trạng thái dựa trên vai trò của người dùng
  const getStatusOptions = () => {
    if (currentUser?.role === 'superadmin') {
      return [
        { value: 'PENDING', label: 'Chờ xử lý' },
        { value: 'COMPLETED', label: 'Hoàn thành' },
        { value: 'CANCELLED', label: 'Hủy' },
      ];
    } else {
      // Các vai trò khác chỉ có thể chọn PENDING hoặc CANCELLED
      return [
        { value: 'PENDING', label: 'Chờ xử lý' },
        { value: 'CANCELLED', label: 'Hủy' },
      ];
    }
  };

  return (
    <Modal
      title="Cập nhật phiếu nhập"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Trường nhà cung cấp */}
        <Form.Item
          label="Chọn Nhà Cung Cấp"
          name="supplierId"
          rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}>
          {suppliersLoading ? (
            <Spin size="small" />
          ) : isError ? (
            <p>Lỗi khi tải danh sách nhà cung cấp</p>
          ) : (
            <Select
              value={selectedSupplier}
              onChange={(value) => setSelectedSupplier(value)}
              placeholder="Chọn nhà cung cấp"
              disabled={!!importData} // Vô hiệu hóa trường này khi cập nhật để không thay đổi nhà cung cấp của phiếu nhập đã có
            >
              {suppliers?.map((supplier) => (
                <Select.Option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item
          label="Ghi chú"
          name="note"
        >
          <Input.TextArea rows={3} placeholder="Nhập ghi chú phiếu nhập" />
        </Form.Item>

        {/* Trạng thái - Được kiểm soát theo vai trò */}
        {status !== 'COMPLETED' && (
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>

            <Select
              value={status}
              onChange={(value) => setStatus(value)}
              placeholder="Chọn trạng thái"
              options={getStatusOptions()} // Sử dụng hàm để lấy tùy chọn
              // Tùy chọn vô hiệu hóa:
              disabled={
                currentUser?.role !== 'superadmin' &&
                status === 'COMPLETED' // Nếu trạng thái đã là COMPLETED, không cho phép thay đổi bởi non-superadmin
              }
            />
          </Form.Item>
        )}

        <Form.Item
          label="Loại phiếu nhập"
          name="isInternal"
          rules={[{ required: true, message: 'Vui lòng chọn loại phiếu nhập' }]}
        >
          <Select
            value={isInternal}
            onChange={(value: boolean) => {
              setIsInternal(value);
              if (!value) form.setFieldsValue({ extra_cost: undefined });
            }}
          >
            <Select.Option value={false}>Nhập kho từ nhà cung cấp</Select.Option>
            <Select.Option value={true}>Nhập kho đổi trả hàng</Select.Option>
          </Select>
        </Form.Item>

        {isInternal && (
          <Form.Item
            label="Chi phí phát sinh"
            name="extra_cost"
            rules={[
              { required: true, message: 'Vui lòng nhập chi phí phát sinh' },
              { type: 'number', min: 0, message: 'Chi phí phải ≥ 0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập chi phí phát sinh"
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
          >
            Cập nhật phiếu nhập
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};