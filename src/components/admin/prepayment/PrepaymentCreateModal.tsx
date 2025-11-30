'use client';

import { Modal, Form, Input, Button, message, Select, Spin, DatePicker, InputNumber } from 'antd';
import { useState } from 'react';
import { useCreatePrepayment } from '@/hooks/prepayment/useCreatePrepayment'; // Hook tạo prepayment
import { useAllCustomers } from '@/hooks/customer/useAllCustomers';

interface PrepaymentCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const PrepaymentCreateModal = ({
  open,
  onClose,
  refetch,
}: PrepaymentCreateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useCreatePrepayment(); // Hook tạo prepayment
  const [status, setStatus] = useState<string>('PENDING'); // Trạng thái mặc định là 'PENDING'

  // Lấy danh sách khách hàng
  const { data: customers, isLoading: customersLoading, isError } = useAllCustomers({});

  const onFinish = async (values: any) => {
    try {
      // Thêm customerId và status vào values khi gửi form
      await mutateAsync({ ...values, status });
      message.success('Tạo phiếu thanh toán thành công');
      onClose();
      form.resetFields();
      refetch?.(); // Lấy lại dữ liệu sau khi thêm
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo phiếu thanh toán');
    }
  };

  return (
    <Modal
      title="Thêm phiếu thanh toán mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Chọn khách hàng */}
        <Form.Item
          label="Chọn Khách Hàng"
          name="customerId" // Đảm bảo dùng customerId để lưu vào form
          rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
        >
          {customersLoading ? (
            <Spin size="small" />
          ) : isError ? (
            <p>Lỗi khi tải danh sách khách hàng</p>
          ) : (
            <Select placeholder="Chọn khách hàng">
              {customers?.map((customer) => (
                <Select.Option key={customer.id} value={customer.id}>
                  {customer.name}
                </Select.Option>
              ))}
            </Select>
          )}
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

        {/* Ngày thanh toán */}
        <Form.Item
          label="Ngày thanh toán"
          name="date"
          rules={[{ required: true, message: 'Vui lòng chọn ngày thanh toán' }]}
        >
         <DatePicker
            showTime
            placeholder="Chọn ngày và giờ thanh toán"
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
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
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
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
            Thêm phiếu thanh toán
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
