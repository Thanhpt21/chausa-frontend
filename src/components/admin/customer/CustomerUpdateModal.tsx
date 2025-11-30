'use client';

import { Modal, Form, Input, Button, message } from 'antd';
import { useEffect } from 'react';
import { useUpdateCustomer } from '@/hooks/customer/useUpdateCustomer';
import { Customer } from '@/types/customer.type'; // bạn nên định nghĩa type này nếu chưa có

interface CustomerUpdateModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  refetch?: () => void;
}

export const CustomerUpdateModal = ({
  open,
  onClose,
  customer,
  refetch,
}: CustomerUpdateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useUpdateCustomer();

  useEffect(() => {
    if (customer && open) {
      form.setFieldsValue({
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        address: customer.address,
        email: customer.email,
         mst: customer.mst,
      });
    }
  }, [customer, open, form]);

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({
        id: customer?.id!,
        data: values,
      });
      message.success('Cập nhật khách hàng thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật khách hàng');
    }
  };

  return (
    <Modal
      title="Cập nhật thông tin khách hàng"
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
          <Input placeholder="Nhập tên khách hàng"/>
        </Form.Item>

        <Form.Item label="Email" name="email">
          <Input placeholder="Nhập email (nếu có)"/>
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[
            {
              pattern: /^\+?\d{7,15}$/,
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
              message: 'Mã số thuế phải là chuỗi số từ 10 đến 12 ký tự',
            },
          ]}>
          <Input placeholder="Nhập mã số thuế (nếu có)"/>
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
        >
          <Input.TextArea rows={2} placeholder="Nhập địa chỉ khách hàng"/>
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
