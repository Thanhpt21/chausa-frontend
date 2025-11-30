'use client';

import { Modal, Form, Input, Button, message, Checkbox, InputNumber, Row, Col } from 'antd';
import { useEffect } from 'react';
import { useUpdateWarranty } from '@/hooks/warranty/useUpdateWarranty';
import { Warranty } from '@/types/warranty.type';

interface WarrantyUpdateModalProps {
  open: boolean;
  onClose: () => void;
  warranty: Warranty | null;
  refetch?: () => void;
}

export const WarrantyUpdateModal = ({
  open,
  onClose,
  warranty,
  refetch,
}: WarrantyUpdateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useUpdateWarranty();

  useEffect(() => {
    if (warranty && open) {
      form.setFieldsValue({
        title: warranty.title,
        model: warranty.model,
        colorTitle: warranty.colorTitle,
        note: warranty.note,
        isResolved: warranty.isResolved,
        quantity: warranty.quantity,
      });
    } else {
      form.resetFields();
    }
  }, [warranty, open, form]);

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({
        id: warranty?.id!,
        data: values,
      });
      message.success('Cập nhật yêu cầu bảo hành thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật bảo hành');
    }
  };

  return (
    <Modal
      title="Cập nhật yêu cầu bảo hành"
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
              label="Model (SKU)"
              name="model"
              rules={[{ required: true, message: 'Vui lòng nhập model (SKU)' }]}
            >
              <Input placeholder="Nhập model (SKU)" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Tên sản phẩm"
              name="title"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Màu sản phẩm"
              name="colorTitle"
              rules={[{ required: true, message: 'Vui lòng nhập màu sản phẩm' }]}
            >
              <Input placeholder="Nhập màu sản phẩm" />
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

        <Form.Item name="isResolved" valuePropName="checked">
          <Checkbox>Đã xử lý</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Cập nhật bảo hành
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
