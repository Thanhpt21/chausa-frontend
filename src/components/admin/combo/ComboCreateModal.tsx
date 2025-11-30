'use client'

import { useCreateCombo } from '@/hooks/combo/useCreateCombo'
import {
  Modal,
  Form,
  Input,
  message,
  Button,
} from 'antd'
import { useEffect } from 'react'

interface ComboCreateModalProps {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

export const ComboCreateModal = ({ open, onClose, refetch }: ComboCreateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useCreateCombo()

  const onFinish = async (values: any) => {
    try {
      // values: { title, description }
      await mutateAsync(values)
      message.success('Tạo combo thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo combo')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open])

  return (
    <Modal
      title="Tạo Combo"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên Combo"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tên combo' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả combo' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
