'use client';

import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Select,
  InputNumber,
  Col,
  Row,
  Divider,
} from 'antd';
import { useEffect, useState } from 'react';
import { useUpdateTransfer } from '@/hooks/transfer/useUpdateTransfer';
import { useUpdateCustomer } from '@/hooks/customer/useUpdateCustomer';
import { Transfer } from '@/types/transfer.type';

interface TransferUpdateModalProps {
  open: boolean;
  onClose: () => void;
  transferData: Transfer | null;
  refetch?: () => void;
}

export const TransferUpdateModal = ({
  open,
  onClose,
  transferData,
  refetch,
}: TransferUpdateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync: updateTransfer, isPending } = useUpdateTransfer();
  const { mutateAsync: updateCustomerAsync } = useUpdateCustomer();

  const [status, setStatus] = useState<string>('PENDING');

  useEffect(() => {
    if (transferData && open) {
      setStatus(transferData.status);
      form.setFieldsValue({
        note: transferData.note,
        status: transferData.status,
        customerName: transferData.customer?.name,
        customerEmail: transferData.customer?.email,
        customerPhoneNumber: transferData.customer?.phoneNumber,
        customerMst: transferData.customer?.mst,
        customerAddress: transferData.customer?.address,
        isInternal: transferData.isInternal,
      });
    }
  }, [transferData, open, form]);

  const onFinish = async (values: any) => {
    try {
      const updatedCustomerData = {
        name: values.customerName,
        email: values.customerEmail,
        phoneNumber: values.customerPhoneNumber,
        mst: values.customerMst,
        address: values.customerAddress,
      };

      const oldCustomer = transferData?.customer;
      const isCustomerChanged =
        oldCustomer &&
        (
          oldCustomer.name !== updatedCustomerData.name ||
          oldCustomer.email !== updatedCustomerData.email ||
          oldCustomer.phoneNumber !== updatedCustomerData.phoneNumber ||
          oldCustomer.mst !== updatedCustomerData.mst ||
          oldCustomer.address !== updatedCustomerData.address
        );

      if (isCustomerChanged) {
        await updateCustomerAsync({
          id: transferData?.customerId!,
          data: updatedCustomerData,
        });
        message.success('Cập nhật thông tin khách hàng thành công');
      }

      const {
        customerName,
        customerEmail,
        customerPhoneNumber,
        customerMst,
        customerAddress,
        ...cleanedValues
      } = values;

      await updateTransfer({
        id: transferData?.id!,
        data: {
          ...cleanedValues,
          status,
        },
      });

      message.success('Cập nhật xuất kho hàng thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const getStatusOptions = () => {
    if (!transferData) return [];

    if (transferData.status === 'PENDING') {
      return [
        { value: 'PENDING', label: 'Chờ xử lý' },
        { value: 'CANCELLED', label: 'Hủy' },

      ];
    }

    if (transferData.status === 'EXPORTED') {
      return [
        { value: 'EXPORTED', label: 'Xuất kho' },
        { value: 'CANCELLED', label: 'Hủy' },
      ];
    }

    return [
      { value: transferData.status, label: transferData.status },
    ];
  };

  return (
    <Modal
      title="Cập nhật xuất kho hàng"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={900}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Divider>Thông tin khách hàng</Divider>

        <Row gutter={16}>
           <Col span={12}>
            <Form.Item name="customerPhoneNumber" label="Số điện thoại">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          
        </Row>

        <Row gutter={16}>
         <Col span={12}>
            <Form.Item name="customerEmail" label="Email" rules={[{ type: 'email' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="customerMst" label="Mã số thuế">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="customerAddress" label="Địa chỉ">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Divider>Thông tin xuất kho hàng</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select
              value={status}
              onChange={(val) => setStatus(val)}
              options={getStatusOptions()}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="isInternal"
            label="Loại xuất kho"
            rules={[{ required: true, message: 'Vui lòng chọn loại xuất kho' }]}
          >
            <Select>
              <Select.Option value={false}>Xuất kho bán hàng</Select.Option>
              <Select.Option value={true}>Xuất kho nội bộ</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={3} placeholder="Nhập ghi chú nếu có" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isPending}>
            Cập nhật xuất kho hàng
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
