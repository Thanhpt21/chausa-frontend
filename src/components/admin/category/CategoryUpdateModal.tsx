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
import { useUpdateCategory } from '@/hooks/category/useUpdateCategory'
import { Category } from '@/types/category.type' // Import Category type


interface CategoryUpdateModalProps {
  open: boolean
  onClose: () => void
  category: Category | null // Đảm bảo type Category
  refetch?: () => void
  allCategories: Category[] // Thêm prop allCategories
}

export const CategoryUpdateModal = ({
  open,
  onClose,
  category,
  refetch,
  allCategories, // Nhận prop allCategories
}: CategoryUpdateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<any[]>([])
  const { mutateAsync, isPending } = useUpdateCategory()

  useEffect(() => {
    if (category && open) {
      form.setFieldsValue({
        title: category.title,
        slug: category.slug,
        parentId: category.parentId || null, // Điền parentId vào form
      })

      setFileList(
        category.image
          ? [
              {
                uid: '-1',
                name: 'image.jpg',
                status: 'done',
                url: category.image,
              },
            ]
          : []
      )
    } else if (!open) { // Reset form khi đóng modal
      form.resetFields();
      setFileList([]);
    }
  }, [category, open, form])

  const onFinish = async (values: any) => {
    try {
      if (!category) {
        message.error('Không tìm thấy danh mục để cập nhật.');
        return;
      }

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
      if (file) { // Chỉ thêm file nếu có
        formData.append('image', file);
      }

      await mutateAsync({
        id: category.id,
        data: formData, // Truyền formData
        file: file, // Nếu API của bạn mong đợi file riêng
      });
      message.success('Cập nhật danh mục thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật danh mục');
    }
  }

  // Lọc danh mục cha: loại bỏ chính nó và các danh mục con của nó để tránh vòng lặp
  const filterParentCategories = (categories: Category[]): Category[] => {
    if (!category) return categories; // Nếu không có category đang chỉnh sửa (trường hợp lạ)

    const excludedIds = new Set<number>();
    // Hàm đệ quy để thu thập tất cả các id của danh mục con
    const collectDescendantIds = (cat: Category) => {
      excludedIds.add(cat.id);
      if (cat.children) { // Giả sử Category có children sau khi fetch
        cat.children.forEach(child => collectDescendantIds(child));
      }
    };

    // Tìm danh mục đầy đủ trong allCategories để có thể truy cập `children`
    const currentCategoryWithChildren = allCategories.find(cat => cat.id === category.id);
    if (currentCategoryWithChildren) {
      collectDescendantIds(currentCategoryWithChildren);
    } else {
      excludedIds.add(category.id);
    }
    
    // Lọc danh sách: không bao gồm các id trong excludedIds
    // Và chỉ cho phép các danh mục cấp cao nhất làm cha trực tiếp (parentId là null)
    return allCategories.filter(cat => 
        !excludedIds.has(cat.id) && 
        cat.parentId === null // Chỉ các danh mục cấp cao nhất
    );
  };

  return (
    <Modal
      title="Cập nhật danh mục"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Tên danh mục" name="title" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Danh mục cha (tùy chọn)" name="parentId">
          <Select
            allowClear
            placeholder="Chọn danh mục cha"
            optionFilterProp="children"
            // FIX: Sử dụng toString() để chuyển đổi children thành chuỗi an toàn
            filterOption={(input, option) =>
              (option?.children?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {filterParentCategories(allCategories).map(cat => (
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
