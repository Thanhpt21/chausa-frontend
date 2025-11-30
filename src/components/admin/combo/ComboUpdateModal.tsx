'use client'

import { useUpdateCombo } from '@/hooks/combo/useUpdateCombo'
import { Combo } from '@/types/combo.type'
import {
  Modal,
  Form,
  Input,
  message,
  Button,
} from 'antd'
import { useEffect } from 'react'

interface ComboUpdateModalProps {
  open: boolean
  onClose: () => void
  combo: Combo | null
  refetch?: () => void
}

export const ComboUpdateModal = ({ open, onClose, combo, refetch }: ComboUpdateModalProps) => {
  const [form] = Form.useForm()
  const { mutateAsync, isPending } = useUpdateCombo()

  useEffect(() => {
    if (combo && open) {
      form.setFieldsValue({
        title: combo.title,
        description: combo.description,
      })
    } else {
      form.resetFields()
    }
  }, [combo, open, form])

  const onFinish = async (values: any) => {
    try {
      if (!combo) return
      await mutateAsync({ id: combo.id, data: values }) // data: {title, description}
      message.success('Cập nhật combo thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật combo')
    }
  }

  return (
    <Modal
      title="Cập nhật Combo"
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
