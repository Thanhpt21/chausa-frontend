'use client';

import { Modal, Form, Input, Button, message } from 'antd';
import { useEffect } from 'react';
import { useUpdateWarehouse } from '@/hooks/warehouse/useUpdateWarehouse'; // Hook cập nhật kho hàng
import { Warehouse } from '@/types/warehouse.type'; // Định nghĩa type cho kho hàng

interface WarehouseUpdateModalProps {
  open: boolean;
  onClose: () => void;
  warehouse: Warehouse | null;
  refetch?: () => void;
}

export const WarehouseUpdateModal = ({
  open,
  onClose,
  warehouse,
  refetch,
}: WarehouseUpdateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useUpdateWarehouse();

  // Reset form fields khi modal mở và có kho hàng cần cập nhật
  useEffect(() => {
    if (warehouse && open) {
      form.setFieldsValue({
        name: warehouse.name,
        address: warehouse.address,
      });
    }
  }, [warehouse, open, form]);

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({
        id: warehouse?.id!, // Assumes warehouse.id is defined
        data: values,
      });
      message.success('Cập nhật kho hàng thành công');
      onClose();
      form.resetFields();
      refetch?.(); // Nếu có, refetch dữ liệu sau khi cập nhật thành công
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật kho hàng');
    }
  };

  return (
    <Modal
      title="Cập nhật thông tin kho hàng"
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
            Cập nhật kho hàng
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
