'use client';

import { Modal, Form, Input, message, Button } from 'antd';
import { useEffect } from 'react';
import { useUpdateProjectCategory } from '@/hooks/project-category/useUpdateProjectCategory';

interface ProjectCategoryUpdateModalProps {
  open: boolean;
  onClose: () => void;
  category: { id: number; title: string } | null;
  refetch?: () => void;
}

export const ProjectCategoryUpdateModal = ({
  open,
  onClose,
  category,
  refetch,
}: ProjectCategoryUpdateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useUpdateProjectCategory();

  useEffect(() => {
    if (category && open) {
      form.setFieldsValue({ title: category.title });
    } else {
      form.resetFields();
    }
  }, [category, open, form]);

  const onFinish = async (values: { title: string }) => {
    try {
      if (!category) return;
      await mutateAsync({ id: category.id, data: values });
      message.success('Cập nhật hạng mục thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật hạng mục');
    }
  };

  return (
    <Modal
      title="Cập nhật hạng mục"
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
