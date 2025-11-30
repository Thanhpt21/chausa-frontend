'use client';

import { Modal, Form, Input, Button, message } from 'antd';
import { useEffect } from 'react';
import { useCreateSupplier } from '@/hooks/supplier/useCreateSupplier';

interface SupplierCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const SupplierCreateModal = ({
  open,
  onClose,
  refetch,
}: SupplierCreateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useCreateSupplier();

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values);
      message.success('Tạo nhà cung cấp thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo nhà cung cấp');
    }
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title="Thêm nhà cung cấp mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên nhà cung cấp"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
        >
          <Input placeholder="Nhập tên nhà cung cấp" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input placeholder="Nhập email (nếu có)" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          label="Mã số thuế"
          name="mst"
          rules={[
            {
              pattern: /^[0-9]{10,12}$/,
              message: 'Mã số thuế phải là chuỗi số từ 10 đến 12 ký tự',
            },
          ]}
        >
          <Input placeholder="Nhập mã số thuế (nếu có)" />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
        >
          <Input.TextArea rows={2} placeholder="Nhập địa chỉ nhà cung cấp" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
          >
            Thêm nhà cung cấp
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
