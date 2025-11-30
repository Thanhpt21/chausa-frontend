'use client';

import { Modal, Form, Input, Button, message } from 'antd';
import { useEffect } from 'react';
import { useUpdateSupplier } from '@/hooks/supplier/useUpdateSupplier'; // Hook để cập nhật nhà cung cấp
import { Supplier } from '@/types/supplier.type'; // Đảm bảo bạn đã định nghĩa type này

interface SupplierUpdateModalProps {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null; // Chắc chắn rằng type Supplier đã được định nghĩa
  refetch?: () => void;
}

export const SupplierUpdateModal = ({
  open,
  onClose,
  supplier,
  refetch,
}: SupplierUpdateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useUpdateSupplier(); // Dùng hook cập nhật nhà cung cấp

  // Khi modal mở, cập nhật giá trị ban đầu cho form
  useEffect(() => {
    if (supplier && open) {
      form.setFieldsValue({
        name: supplier.name,
        phoneNumber: supplier.phoneNumber,
        address: supplier.address,
        email: supplier.email,
        mst: supplier.mst
      });
    }
  }, [supplier, open, form]);

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({
        id: supplier?.id!,  // Giả sử `id` là trường khóa chính của nhà cung cấp
        data: values,
      });
      message.success('Cập nhật nhà cung cấp thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật nhà cung cấp');
    }
  };

  return (
    <Modal
      title="Cập nhật thông tin nhà cung cấp"
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
          <Input placeholder="Nhập tên nhà cung cấp"/>
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[

            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input placeholder="Nhập email (nếu có)"/>
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[
            {
              pattern: /^\+?\d{7,15}$/, // Mẫu số điện thoại hợp lệ
              message: 'Số điện thoại không hợp lệ',
            },
          ]}
        >
          <Input placeholder="Nhập số điện thoại"/>
        </Form.Item>

        <Form.Item
          label="Mã số thuế"
          name="mst"
          rules={[
            { 
              pattern: /^[0-9]{10,12}$/, 
              message: 'Mã số thuế phải là chuỗi số từ 10 đến 12 ký tự'
            }
          ]}>
          <Input placeholder="Nhập mã số thuế (nếu có)"/>
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
        >
          <Input.TextArea rows={2} placeholder="Nhập địa chỉ nhà cung cấp"/>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
