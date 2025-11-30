'use client';

import { useCreateProjectCategory } from '@/hooks/project-category/useCreateProjectCategory';
import { Modal, Form, Input, message, Button } from 'antd';
import { useEffect } from 'react';

interface ProjectCategoryCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const ProjectCategoryCreateModal = ({
  open,
  onClose,
  refetch,
}: ProjectCategoryCreateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useCreateProjectCategory();

  const onFinish = async (values: { title: string }) => {
    try {
      await mutateAsync(values);
      message.success('Tạo hạng mục thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo hạng mục');
    }
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open]);

  return (
    <Modal
      title="Tạo hạng mục thi công"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên hạng mục"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tên hạng mục' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
