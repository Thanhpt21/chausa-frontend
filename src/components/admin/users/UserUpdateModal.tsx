'use client'

import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Switch,
  message,
  Button,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useUpdateUser } from '@/hooks/user/useUpdateUser'

interface UserUpdateModalProps {
  open: boolean
  onClose: () => void
  user: any
  refetch?: () => void
}

export const UserUpdateModal = ({
  open,
  onClose,
  user,
  refetch,
}: UserUpdateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<any[]>([])
  const { mutateAsync, isPending } = useUpdateUser()

  useEffect(() => {
    if (user && open) {
      form.setFieldsValue({
        name: user.name,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        role: user.role,
        isActive: user.isActive,
      })

      setFileList(
        user.profilePicture
          ? [
              {
                uid: '-1',
                name: 'avatar.jpg',
                status: 'done',
                url: user.profilePicture,
              },
            ]
          : []
      )
    }
  }, [user, open, form])

  const onFinish = async (values: any) => {
    console.log('Submit values:', values);
    try {
      const file = fileList?.[0]?.originFileObj
    const { file: _, ...rest } = values
    await mutateAsync({
    id: user.id,
    data: values,
    file,
    })
      message.success('Cập nhật user thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật user')
    }
  }

  return (
    <Modal
      title="Cập nhật người dùng"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Tên" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Email">
          <Input value={user?.email} disabled />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phoneNumber" rules={[
          {
            pattern: /^\+?\d{7,15}$/, // ví dụ số điện thoại quốc tế: cho phép +, 7-15 số
            message: 'Số điện thoại không hợp lệ',
          },
        ]}>
          <Input />
        </Form.Item>

        <Form.Item label="Giới tính" name="gender">
          <Select
            allowClear
            options={[
              { label: 'Nam', value: 'male' },
              { label: 'Nữ', value: 'female' },
              { label: 'Khác', value: 'other' },
            ]}
          />
        </Form.Item>

        <Form.Item label="Vai trò" name="role">
          <Select
            options={[
              { label: 'Admin', value: 'admin' },
              { label: 'Khách hàng', value: 'customer' },
            ]}
          />
        </Form.Item>

        <Form.Item label="Trạng thái hoạt động" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="Ảnh đại diện">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
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
