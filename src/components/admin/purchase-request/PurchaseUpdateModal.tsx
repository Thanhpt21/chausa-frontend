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
  Select,
} from 'antd';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

import { useUpdatePurchaseRequest } from '@/hooks/purchase/useUpdatePurchaseRequest';
import { useUpdateSupplier } from '@/hooks/supplier/useUpdateSupplier';
import { useAllSuppliers } from '@/hooks/supplier/useAllSuppliers';
import { PurchaseRequest } from '@/types/purchase-request.type';
import { useAuth } from '@/context/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
  purchaseData: PurchaseRequest | null;
  refetch?: () => void;
}

export const PurchaseUpdateModal = ({ open, onClose, purchaseData, refetch }: Props) => {
  const [form] = Form.useForm();
  const { mutateAsync: updatePurchase, isPending } = useUpdatePurchaseRequest();
  const { mutateAsync: updateSupplier } = useUpdateSupplier();
  const [status, setStatus] = useState<'PENDING' | 'COMPLETED' | 'CANCELLED'>('PENDING');
  const [supplierId, setSupplierId] = useState<number>();

  const { currentUser } = useAuth();



  useEffect(() => {
    if (purchaseData && open) {
      setStatus(purchaseData.status);
      setSupplierId(purchaseData.supplierId);
      form.setFieldsValue({
        note: purchaseData.note,
        status: purchaseData.status,
        supplierPhoneNumber: purchaseData.supplier?.phoneNumber,
        supplierName: purchaseData.supplier?.name,
        supplierEmail: purchaseData.supplier?.email,
        supplierAddress: purchaseData.supplier?.address,
        supplierMst: purchaseData.supplier?.mst || '',
      });
    }
  }, [open, purchaseData, form]);

  const onFinish = async (values: any) => {
    try {
      const { supplierName, supplierPhoneNumber, supplierEmail, supplierAddress,supplierMst, ...rest } = values;

      if (purchaseData && purchaseData.supplier) {
        const old = purchaseData.supplier;
        const changed =
          old.name !== supplierName ||
          old.phoneNumber !== supplierPhoneNumber ||
          old.email !== supplierEmail ||
          old.address !== supplierAddress;
          old.mst !== supplierMst;
        if (changed) {
          await updateSupplier({
            id: purchaseData.supplierId,
            data: {
              name: supplierName,
              phoneNumber: supplierPhoneNumber,
              email: supplierEmail,
              address: supplierAddress,
              mst: supplierMst
            },
          });
          message.success('Cập nhật thông tin nhà cung cấp thành công');
        }
      }

      await updatePurchase({
        id: purchaseData!.id,
        data: {
          ...rest,
          status,
          supplierId: purchaseData!.supplierId,
        },
      });

      message.success('Cập nhật phiếu mua hàng thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật phiếu mua hàng');
    }
  };

  const statusOptions = currentUser?.role === 'superadmin'
    ? [
        { value: 'PENDING', label: 'Chờ xử lý' },
        { value: 'COMPLETED', label: 'Hoàn thành' },
        { value: 'CANCELLED', label: 'Hủy' },
      ]
    : [
        { value: 'PENDING', label: 'Chờ xử lý' },
        { value: 'CANCELLED', label: 'Hủy' },
      ];

  return (
    <Modal
      title="Cập nhật phiếu mua hàng"
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
              name="supplierPhoneNumber"
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tên nhà cung cấp"
              name="supplierName"
              rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
            >
              <Input placeholder="Tên nhà cung cấp" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="supplierEmail"
              rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
            >
              <Input placeholder="Email" />
            </Form.Item>
          </Col>
           <Col span={12}>
            <Form.Item
              label="Mã số thuế"
              name="supplierMst"
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
            name="supplierAddress"
        >
            <Input.TextArea rows={2} placeholder="Địa chỉ nhà cung cấp" />
        </Form.Item>

        <Divider>Thông tin phiếu mua hàng</Divider>

       {purchaseData?.status !== 'COMPLETED' && (
        <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select
            value={status}
            onChange={(val) => setStatus(val)}
            options={statusOptions}
            />
        </Form.Item>
        )}

        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea rows={3} placeholder="Ghi chú (nếu có)" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Cập nhật phiếu mua hàng
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
