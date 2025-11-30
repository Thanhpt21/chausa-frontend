'use client';

import { Modal, Form, Input, Button, message, Select, Spin, DatePicker, Typography, InputNumber, Divider, Row, Col } from 'antd';
import { useEffect, useState } from 'react';
import { useCreateExport } from '@/hooks/export/useCreateExport'; // Hook để gọi API tạo export
import { useAllCustomers } from '@/hooks/customer/useAllCustomers'; // Hook lấy tất cả khách hàng
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateCustomer } from '@/hooks/customer/useCreateCustomer';


interface ExportCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const ExportCreateModal = ({
  open,
  onClose,
  refetch,
}: ExportCreateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useCreateExport();
  const { mutateAsync: CreateCustomer } = useCreateCustomer();
  const [status] = useState<string>('PENDING');
  const [customerId, setCustomerId] = useState<number | undefined>(undefined); // Lưu ID khách hàng đã chọn
  const [searchPhone, setSearchPhone] = useState<string>('');
  const debouncedPhone = useDebounce(searchPhone, 500); 
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [taxType, setTaxType] = useState<'vat' | 'pitRate'>('vat');
  const [isProject, setIsProject] = useState<boolean>(false);

  // Lấy danh sách khách hàng
 const {
  data: customers,
} = useAllCustomers({ search: /^\d{10}$/.test(debouncedPhone) ? debouncedPhone : '' });

  useEffect(() => {
    if (/^\d{10}$/.test(debouncedPhone) && customers && customers.length === 1) {
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
        // Không set phoneNumber ở đây để giữ nguyên input người dùng nhập
      });
    } else {
      setCustomerId(undefined);
      setIsExistingCustomer(false);
      // Không set gì để giữ nguyên số điện thoại đang nhập
    }
  }, [debouncedPhone, customers]);

  const onFinish = async (values: any) => {
    try {
      // Tách riêng thông tin khách hàng
      const { name, email, phoneNumber, mst, address, ...rest } = values;
      let finalCustomerId = customerId;

      if (!isExistingCustomer) {
        const createdCustomer = await CreateCustomer({
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

      // Chuẩn bị dữ liệu export
      const exportPayload = {
        ...rest,
        status,
        customerId: finalCustomerId,
        vat: taxType === 'vat' ? values.vat ?? 0 : 0,
        pitRate: taxType === 'pitRate' ? values.pitRate ?? 0 : 0,
        isProject: values.isProject,
        advancePercent: values.isProject ? values.advancePercent : undefined,
      };

      await mutateAsync(exportPayload);

      message.success('Tạo báo giá thành công');
      onClose();
      form.resetFields();
      refetch?.();
      setCustomerId(undefined);
      setIsExistingCustomer(false);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo báo giá');
    }
  };

  return (
      <Modal
        title="Thêm báo giá mới"
        open={open}
        onCancel={onClose}
        footer={null}
        destroyOnClose
        width={900} // ✅ Mở rộng modal
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>

          <Divider>Thông tin khách hàng mới</Divider>

          <Row gutter={16}>
             <Col span={12}>
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[{ required: true, message: 'Vui lòng nhập sđt' }]}
            >
              <Input
                placeholder="Nhập số điện thoại"
                onChange={e => setSearchPhone(e.target.value)}
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
                rules={[
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
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

          <Form.Item
            label="Địa chỉ"
            name="address"
          >
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ khách hàng" />
          </Form.Item>

          <Divider>Thông tin báo giá</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày báo giá"
                name="export_date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày báo giá' }]}
              >
                <DatePicker
                  showTime
                  placeholder="Chọn ngày và giờ báo giá"
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Chọn loại thuế">
                <Select value={taxType} onChange={(value) => setTaxType(value)}>
                  <Select.Option value="vat">VAT</Select.Option>
                  <Select.Option value="pitRate">Thuế TNCN</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {taxType === 'vat' && (
            <Form.Item
              label="VAT (%)"
              name="vat"
              initialValue={8}
              rules={[{ required: true, message: 'Vui lòng nhập VAT' }]}
            >
              <Input type="number" min={0} max={100} placeholder="Nhập VAT (%)" />
            </Form.Item>
          )}

          {taxType === 'pitRate' && (
            <Form.Item
              label="Thuế TNCN (%)"
              name="pitRate"
              initialValue={1.5}
              rules={[{ required: true, message: 'Vui lòng nhập Thuế TNCN' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                step={0.1}
                placeholder="Nhập Thuế TNCN (%)"
              />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại báo giá"
                name="isProject"
                initialValue={false}
                rules={[{ required: true, message: 'Vui lòng chọn loại báo giá' }]}
              >
                <Select
                  onChange={(value: boolean) => {
                    setIsProject(value);
                    if (!value) {
                      form.setFieldsValue({ advancePercent: undefined });
                    }
                  }}
                >
                  <Select.Option value={false}>Báo giá bán hàng</Select.Option>
                  <Select.Option value={true}>Báo giá thi công, lắp đặt</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              {isProject && (
                <Form.Item
                  label="Phần trăm tạm ứng (%)"
                  name="advancePercent"
                  rules={[
                    { required: true, message: 'Vui lòng nhập phần trăm tạm ứng' },
                    { type: 'number', min: 0, max: 100, message: 'Phần trăm tạm ứng phải từ 0 đến 100' },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value!.replace('%', '') as any}
                    style={{ width: '100%' }}
                    placeholder="Nhập phần trăm tạm ứng"
                  />
                </Form.Item>
              )}
            </Col>
          </Row>

          <Form.Item
            label="Ghi chú"
            name="note">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú báo giá" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isPending} block>
              Thêm báo giá
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
};
