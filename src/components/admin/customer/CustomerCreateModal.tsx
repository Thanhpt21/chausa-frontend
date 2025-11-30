'use client';

import { Modal, Form, Input, Button, message } from 'antd';
import { useEffect } from 'react';
import { useCreateCustomer } from '@/hooks/customer/useCreateCustomer';

interface CustomerCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const CustomerCreateModal = ({
  open,
  onClose,
  refetch,
}: CustomerCreateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useCreateCustomer();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ loyaltyPoint: 0 });
    }
  }, [open, form]);

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values);
      message.success('Tạo khách hàng thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo khách hàng');
    }
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title="Thêm khách hàng mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên khách hàng"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
        >
          <Input placeholder="Nhập tên khách hàng" />
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
              message: 'Mã số thuế phải là chuỗi số từ 10 đến 12 ký tự'
            }
          ]}
        >
          <Input placeholder="Nhập mã số thuế (nếu có)" />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
        >
          <Input.TextArea rows={2} placeholder="Nhập địa chỉ khách hàng" />
        </Form.Item>

        <Form.Item
          name="loyaltyPoint"
          style={{ display: 'none' }}
        >
          <Input type="number" defaultValue={0} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
          >
            Thêm khách hàng
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
