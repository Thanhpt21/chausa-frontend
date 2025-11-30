'use client';

import { Modal, Form, Input, Button, message, InputNumber, Row, Col } from 'antd';
import { useEffect } from 'react';
import { useCreateWarranty } from '@/hooks/warranty/useCreateWarranty';

interface WarrantyCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const WarrantyCreateModal = ({
  open,
  onClose,
  refetch,
}: WarrantyCreateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useCreateWarranty();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const onFinish = async (values: any) => {
    try {
      await mutateAsync(values);
      message.success('Tạo yêu cầu bảo hành thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo bảo hành');
    }
  };

  return (
    <Modal
      title="Thêm yêu cầu bảo hành"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên sản phẩm"
              name="title"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Model (SKU)"
              name="model"
              rules={[{ required: true, message: 'Vui lòng nhập model (SKU)' }]}
            >
              <Input placeholder="Nhập model (SKU)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Màu sắc"
              name="colorTitle"
              rules={[{ required: true, message: 'Vui lòng nhập màu sắc' }]}
            >
              <Input placeholder="Nhập màu sắc" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Số lượng"
              name="quantity"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập số lượng" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Ghi chú"
          name="note"
          rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
        >
          <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Thêm yêu cầu bảo hành
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
