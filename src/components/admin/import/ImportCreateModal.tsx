'use client';

import { Modal, Form, Input, Button, message, Select, Spin, DatePicker, InputNumber } from 'antd';
import { useEffect, useState } from 'react';
import { useCreateImport } from '@/hooks/import/useCreateImport'; // Hook để gọi API tạo import
import { useAllSuppliers } from '@/hooks/supplier/useAllSuppliers'; // Hook lấy tất cả nhà cung cấp
import { useAuth } from '@/context/AuthContext';

interface ImportCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const ImportCreateModal = ({
  open,
  onClose,
  refetch,
}: ImportCreateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useCreateImport();
  const [status] = useState<string>('PENDING');
  const [isInternal, setIsInternal] = useState<boolean>(false);
  const { data: suppliers, isLoading: suppliersLoading, isError } = useAllSuppliers({});

  const onFinish = async (values: any) => {
    try {
      // Thêm supplierId vào values khi gửi form
      await mutateAsync({ ...values, status });
      message.success('Tạo phiếu nhập thành công');
      onClose();
      form.resetFields();
      setIsInternal(false);
      refetch?.(); // Lấy lại dữ liệu sau khi thêm
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo phiếu nhập');
    }
  };

  const handleIsInternalChange = (value: boolean) => {
    setIsInternal(value);
    if (!value) {
      form.setFieldsValue({ extra_cost: undefined });
    }
  };


  return (
    <Modal
      title="Thêm phiếu nhập mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Chọn Nhà Cung Cấp"
          name="supplierId" // Đảm bảo dùng supplierId để lưu vào form
          rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
        >
          {suppliersLoading ? (
            <Spin size="small" />
          ) : isError ? (
            <p>Lỗi khi tải danh sách nhà cung cấp</p>
          ) : (
            <Select
              placeholder="Chọn nhà cung cấp"
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

        

         <Form.Item
          label="Ngày nhập kho"
          name="import_date"
          rules={[{ required: true, message: 'Vui lòng chọn ngày nhập kho' }]}>
          <DatePicker
            showTime
            placeholder="Chọn ngày và giờ nhập kho"
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Loại phiếu nhập"
          name="isInternal"
          rules={[{ required: true, message: 'Vui lòng chọn loại phiếu nhập' }]}
          initialValue={false}
        >
          <Select onChange={handleIsInternalChange}>
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
              { type: 'number', min: 0, message: 'Chi phí phải lớn hơn hoặc bằng 0' },
            ]}
          >
            <InputNumber
              placeholder="Nhập chi phí phát sinh"
              style={{ width: '100%' }}
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
            Thêm phiếu nhập
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
