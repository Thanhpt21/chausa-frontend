'use client';

import {
  Modal,
  Form,
  Input,
  Button,
  message,
  DatePicker,
  Divider,
  Row,
  Col,
  Select,
} from 'antd';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

import { useAllCustomers } from '@/hooks/customer/useAllCustomers';
import { useCreateCustomer } from '@/hooks/customer/useCreateCustomer';
import { useCreateTransfer } from '@/hooks/transfer/useCreateTransfer';

const { Option } = Select;

interface TransferCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

const TransferCreateModal = ({ open, onClose, refetch }: TransferCreateModalProps) => {
  const [form] = Form.useForm();
  const [status] = useState<'PENDING'>('PENDING');
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [searchPhone, setSearchPhone] = useState('');
  const debouncedPhone = useDebounce(searchPhone, 500);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);

  const { mutateAsync: createTransfer, isPending } = useCreateTransfer();
  const { mutateAsync: createCustomer } = useCreateCustomer();

  const { data: customers } = useAllCustomers({
    search: /^\d{10}$/.test(debouncedPhone) ? debouncedPhone : '',
  });

  useEffect(() => {
    if (/^\d{10}$/.test(debouncedPhone) && customers?.length === 1) {
      const [cust] = customers;
      setCustomerId(cust.id);
      setIsExistingCustomer(true);
      form.setFieldsValue({
        customerId: cust.id,
        name: cust.name,
        email: cust.email,
        phoneNumber: cust.phoneNumber,
        mst: cust.mst,
        address: cust.address,
      });
    } else if (!/^\d{10}$/.test(debouncedPhone)) {
      setCustomerId(undefined);
      setIsExistingCustomer(false);
      form.setFieldsValue({
        customerId: undefined,
        name: '',
        email: '',
        mst: '',
        address: '',
      });
    } else {
      setCustomerId(undefined);
      setIsExistingCustomer(false);
    }
  }, [debouncedPhone, customers]);

  const onFinish = async (values: any) => {
    try {
      const { name, email, phoneNumber, mst, address, isInternal, ...rest } = values;
      let finalCustomerId = customerId;

      if (!isExistingCustomer) {
        const createdCustomer = await createCustomer({
          name,
          email,
          phoneNumber,
          mst,
          address,
        });

        if (!createdCustomer?.data?.id) {
          throw new Error('Không lấy được id khách hàng mới');
        }

        finalCustomerId = createdCustomer.data.id;
      }


      const payload = {
        ...rest,
        status,
        customerId: finalCustomerId,
        isInternal
      };

      await createTransfer(payload);

      message.success('Tạo Mã đơn hàng thành công');
      onClose();
      form.resetFields();
      refetch?.();
      setCustomerId(undefined);
      setIsExistingCustomer(false);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo Mã đơn hàng');
    }
  };

  return (
    <Modal
      title="Thêm Mã đơn hàng"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Divider>Thông tin khách hàng</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
            >
              <Input
                placeholder="Nhập số điện thoại"
                onChange={(e) => setSearchPhone(e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tên khách hàng"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
            >
              <Input placeholder="Nhập tên khách hàng" />
            </Form.Item>
          </Col>
         
        </Row>

        <Row gutter={16}>
           <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
            >
              <Input placeholder="Nhập email khách hàng" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Mã số thuế"
              name="mst"
              rules={[
                { pattern: /^[0-9]{10,12}$/, message: 'Mã số thuế phải là 10-12 chữ số' },
              ]}
            >
              <Input placeholder="Nhập mã số thuế" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Địa chỉ" name="address">
          <Input.TextArea rows={2} placeholder="Nhập địa chỉ khách hàng" />
        </Form.Item>

        <Divider>Thông tin xuất kho</Divider>

          <Form.Item
            label="Mã đơn hàng"
            name="note"
            rules={[{ required: true, message: 'Vui lòng nhập mã đơn hàng' }]}
          >
            <Input placeholder="Nhập mã đơn hàng" />
          </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Ngày đặt hàng"
              name="transfer_date"
              rules={[{ required: true, message: 'Vui lòng chọn ngày xuất kho' }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="Chọn ngày và giờ"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
           <Col span={12}>
            <Form.Item
              label="Loại"
              name="isInternal"
              rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
              initialValue={false} // mặc định là xuất kho bán hàng
            >
              <Select
                options={[
                  { label: 'Đặt hàng', value: false },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

       

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Tạo Mã đơn hàng
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TransferCreateModal;
