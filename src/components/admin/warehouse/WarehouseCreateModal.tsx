'use client';

import { Modal, Form, Input, Button, message } from 'antd';
import { useEffect } from 'react';
import { useCreateWarehouse } from '@/hooks/warehouse/useCreateWarehouse'; // Hook tạo kho hàng

interface WarehouseCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const WarehouseCreateModal = ({
  open,
  onClose,
  refetch,
}: WarehouseCreateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useCreateWarehouse();

  // Reset fields when modal opens
  useEffect(() => {
    if (open) {
      form.setFieldsValue({}); // Reset the form when modal opens
    }
  }, [open, form]);

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values); // Gọi API để tạo kho hàng
      message.success('Tạo kho hàng thành công');
      onClose();
      form.resetFields();
      refetch?.(); // Nếu có cần phải tải lại danh sách
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo kho hàng');
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title="Thêm kho hàng mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên kho hàng"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên kho hàng' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ kho hàng' }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
          >
            Thêm kho hàng
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
