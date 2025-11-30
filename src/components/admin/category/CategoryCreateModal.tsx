'use client'

import {
  Modal,
  Form,
  Input,
  Upload,
  message,
  Button,
  Select, // Import Select
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useCreateCategory } from '@/hooks/category/useCreateCategory'
import { Category } from '@/types/category.type' // Import Category type

interface CategoryCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
  allCategories: Category[] // Thêm prop allCategories
}

export const CategoryCreateModal = ({
  open,
  onClose,
  refetch,
  allCategories, // Nhận prop allCategories
}: CategoryCreateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<any[]>([])
  const { mutateAsync, isPending } = useCreateCategory()

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setFileList([])
    }
  }, [open, form])

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);


      let parentIdValue: string | number | null = null;
      if (values.parentId === null || values.parentId === undefined) {
        parentIdValue = ''; // Gửi chuỗi rỗng để backend DTO xử lý thành null
      } else {
        parentIdValue = Number(values.parentId); // Ép kiểu thành số
        if (isNaN(parentIdValue)) {
            message.error('ID danh mục cha không hợp lệ.');
            return;
        }
      }
      formData.append('parentId', parentIdValue.toString());

      const file = fileList?.[0]?.originFileObj;
      if (file) {
        formData.append('image', file);
      }
      await mutateAsync(formData); // Truyền formData
      message.success('Tạo danh mục thành công');
      onClose();
      form.resetFields();
      setFileList([]);
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo danh mục');
    }
  }

  // Lọc danh mục cha: chỉ hiển thị các danh mục cấp cao nhất (không có parentId)
  const rootCategories = allCategories.filter(cat => cat.parentId === null);

  return (
    <Modal
      title="Tạo danh mục mới"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên danh mục"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        >
          <Input />
        </Form.Item>


        <Form.Item label="Danh mục cha (tùy chọn)" name="parentId">
          <Select
            allowClear
            placeholder="Chọn danh mục cha"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {rootCategories.map(cat => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
          >
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}