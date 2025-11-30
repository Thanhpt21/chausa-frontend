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
  Spin,
} from 'antd';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

import { useAllSuppliers } from '@/hooks/supplier/useAllSuppliers';
import { useCreateSupplier } from '@/hooks/supplier/useCreateSupplier'; // hook tạo nhà cung cấp
import { useCreatePurchaseRequest } from '@/hooks/purchase/useCreatePurchaseRequest';

interface PurchaseCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

const PurchaseCreateModal = ({ open, onClose, refetch }: PurchaseCreateModalProps) => {
  const [form] = Form.useForm();
  const [status] = useState<'PENDING'>('PENDING');
  const [supplierId, setSupplierId] = useState<number | undefined>(undefined);
  const [searchPhone, setSearchPhone] = useState('');
  const debouncedPhone = useDebounce(searchPhone, 500);
  const [isExistingSupplier, setIsExistingSupplier] = useState(false);

  const { mutateAsync: createPurchase, isPending } = useCreatePurchaseRequest();
  const { mutateAsync: createSupplier } = useCreateSupplier();

  // Lấy nhà cung cấp theo số điện thoại
  const { data: suppliers, isLoading, isError } = useAllSuppliers({
    search: /^\d{10}$/.test(debouncedPhone) ? debouncedPhone : '',
  });

  useEffect(() => {
    if (/^\d{10}$/.test(debouncedPhone) && suppliers?.length === 1) {
      const [sup] = suppliers;
      setSupplierId(sup.id);
      setIsExistingSupplier(true);
      form.setFieldsValue({
        supplierId: sup.id,
        name: sup.name,
        phoneNumber: sup.phoneNumber,
        email: sup.email,
        address: sup.address,
        mst: sup.mst,
      });
    } else {
      setSupplierId(undefined);
      setIsExistingSupplier(false);
      form.setFieldsValue({
        supplierId: undefined,
        name: '',
        phoneNumber: debouncedPhone,
        email: '',
        address: '',
        mst: '',
      });
    }
  }, [debouncedPhone, suppliers, form]);

  const onFinish = async (values: any) => {
    try {
      const { name, phoneNumber, email, address, mst, purchase_date, note, ...rest } = values;
      let finalSupplierId = supplierId;

      if (!isExistingSupplier) {
        // Tạo nhà cung cấp mới
        const createdSupplier = await createSupplier({
          name,
          phoneNumber,
          email,
          address,
          mst,
        });

        if (!createdSupplier?.data?.id) {
          throw new Error('Không lấy được id nhà cung cấp mới');
        }

        finalSupplierId = createdSupplier.data.id;
      }

      // Tạo phiếu mua hàng với supplierId
      await createPurchase({
        supplierId: finalSupplierId,
        status,
        purchase_date,
        note,
        ...rest,
      });

      message.success('Tạo phiếu mua hàng thành công');
      onClose();
      form.resetFields();
      refetch?.();
      setSupplierId(undefined);
      setIsExistingSupplier(false);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo phiếu mua hàng');
    }
  };

  return (
    <Modal
      title="Thêm phiếu mua hàng"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Divider>Thông tin nhà cung cấp</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^\d{10}$/, message: 'Số điện thoại phải có 10 chữ số' },
              ]}
            >
              <Input
                placeholder="Nhập số điện thoại nhà cung cấp"
                onChange={(e) => setSearchPhone(e.target.value)}
                disabled={isExistingSupplier}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Tên nhà cung cấp"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
            >
              <Input placeholder="Nhập tên nhà cung cấp" />
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
              <Input placeholder="Nhập email nhà cung cấp" />
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
          <Input.TextArea rows={2} placeholder="Nhập địa chỉ nhà cung cấp" />
        </Form.Item>

        <Divider>Thông tin phiếu mua hàng</Divider>

        <Form.Item
          label="Ngày nhập kho"
          name="purchase_date"
          rules={[{ required: true, message: 'Vui lòng chọn ngày nhập kho' }]}
        >
          <DatePicker
            showTime
            placeholder="Chọn ngày và giờ nhập kho"
            format="DD-MM-YYYY HH:mm:ss"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea rows={3} placeholder="Ghi chú thêm (nếu có)" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Tạo phiếu mua hàng
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PurchaseCreateModal;
