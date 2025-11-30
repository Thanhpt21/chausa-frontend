'use client';

import { Modal, Form, Input, Button, message, Select, InputNumber } from 'antd';
import { useEffect, useState } from 'react';
import { useUpdatePrepayment } from '@/hooks/prepayment/useUpdatePrepayment'; // Hook để cập nhật Prepayment
import { Prepayment } from '@/types/prepayment.type'; // Đảm bảo bạn đã định nghĩa type này
import { useAllCustomers } from '@/hooks/customer/useAllCustomers'; // Hook lấy danh sách khách hàng

interface PrepaymentUpdateModalProps {
  open: boolean;
  onClose: () => void;
  prepayment: Prepayment | null; // Chắc chắn rằng type Prepayment đã được định nghĩa
  refetch?: () => void;
}

export const PrepaymentUpdateModal = ({
  open,
  onClose,
  prepayment,
  refetch,
}: PrepaymentUpdateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useUpdatePrepayment(); // Dùng hook cập nhật Prepayment
  const [status, setStatus] = useState<string>('PENDING'); // Trạng thái mặc định là 'PENDING'

  // Lấy danh sách khách hàng
  const { data: customers, isLoading: customersLoading } = useAllCustomers({});

  // Khi modal mở, cập nhật giá trị ban đầu cho form
  useEffect(() => {
    if (prepayment && open) {
      const formattedDate = prepayment.date ? prepayment.date.split('T')[0] : ''; 
      form.setFieldsValue({
        customerId: prepayment.customerId,
        amountMoney: prepayment.amountMoney,
        note: prepayment.note,
        date: formattedDate,
        status: prepayment.status || 'PENDING', // Nếu có trường `status`, mặc định là 'PENDING'
      });
      setStatus(prepayment.status || 'PENDING');
    }
  }, [prepayment, open, form]);

  const onFinish = async (values: any) => {
    try {
      await mutateAsync({
        id: prepayment?.id!,  // Giả sử `id` là trường khóa chính của Prepayment
        data: { ...values, status }, // Thêm `status` vào dữ liệu khi gửi
      });
      message.success('Cập nhật thông tin phiếu thanh toán thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật phiếu thanh toán');
    }
  };

  return (
    <Modal
      title="Cập nhật thông tin phiếu thanh toán"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Chọn khách hàng */}
        <Form.Item
          label="Khách hàng"
          name="customerId"
          rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}>
          <Select
            placeholder="Chọn khách hàng"
            loading={customersLoading}
          >
            {customers?.map((customer) => (
              <Select.Option key={customer.id} value={customer.id}>
                {customer.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Số tiền thanh toán */}
        <Form.Item
          label="Số tiền thanh toán"
          name="amountMoney"
          rules={[{ required: true, message: 'Vui lòng nhập số tiền thanh toán' }]}
        >
          <InputNumber
            placeholder="Nhập số tiền thanh toán"
            min={0}
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
          />
        </Form.Item>

        {/* Ghi chú */}
        <Form.Item
          label="Ghi chú"
          name="note"
        >
          <Input.TextArea rows={3} placeholder="Nhập ghi chú phiếu thanh toán" />
        </Form.Item>

      
        {/* Trạng thái */}
        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
          <Select
            value={status}
            onChange={(value) => setStatus(value)} // Thay đổi trạng thái
            placeholder="Chọn trạng thái"
            options={[
              { value: 'PENDING', label: 'Chờ xử lý' },
              { value: 'PROCESSING', label: 'Đang xử lý' },
              { value: 'COMPLETED', label: 'Hoàn thành' },
              { value: 'CANCELLED', label: 'Hủy' },
            ]}
          />
        </Form.Item>

        {/* Nút submit */}
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
  );
};
