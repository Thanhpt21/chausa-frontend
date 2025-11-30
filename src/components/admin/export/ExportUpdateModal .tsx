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
  Checkbox,
} from 'antd';
import { useEffect, useState } from 'react';
import { useUpdateExport } from '@/hooks/export/useUpdateExport';
import { Export } from '@/types/export.type';
import { useAllCustomers } from '@/hooks/customer/useAllCustomers';
import { useAuth } from '@/context/AuthContext';
import { useUpdateCustomer } from '@/hooks/customer/useUpdateCustomer';
import { useTotalAmountForCustomer } from '@/hooks/prepayment/useTotalAmountForCustomer';
import { useUpdatePrepaymentStatus } from '@/hooks/prepayment/useUpdatePrepaymentStatus';

interface ExportUpdateModalProps {
  open: boolean;
  onClose: () => void;
  exportData: Export | null;
  refetch?: () => void;
}

export const ExportUpdateModal = ({
  open,
  onClose,
  exportData,
  refetch,
}: ExportUpdateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useUpdateExport();
  const { mutateAsync: updateCustomerAsync } = useUpdateCustomer();

  const [status, setStatus] = useState<string>('PENDING');
  const [selectedCustomer, setSelectedCustomer] = useState<number | undefined>();
  const [additionalCost, setAdditionalCost] = useState<number>(0);
  const [extraCost, setExtraCost] = useState<number>(0);
  const [taxType, setTaxType] = useState<'vat' | 'pitRate'>('vat');
  const [vat, setVat] = useState<number>(0);
  const [pitRate, setPitrate] = useState<number>(0);
  const [applyLoyaltyPoint, setApplyLoyaltyPoint] = useState(false);
  const [loyaltyPoint, setLoyaltyPoint] = useState<number>(0);
  

  const { currentUser } = useAuth();
  const { data: customers } = useAllCustomers({});
  const { data: totalAmountData, isLoading, error } = useTotalAmountForCustomer(selectedCustomer || 0);
  const { mutateAsync: updatePrepaymentStatus } = useUpdatePrepaymentStatus();


  useEffect(() => {
    if (exportData && open) {
      // ... các setState khác
      setLoyaltyPoint(exportData.customer?.loyaltyPoint ?? 0);
      setApplyLoyaltyPoint(!!exportData.applyLoyaltyPoint);
    }
  }, [exportData, open]);


  useEffect(() => {
    if (exportData && open) {
      setStatus(exportData.status);
      setSelectedCustomer(exportData.customerId);
      setAdditionalCost(exportData.additional_cost ?? 0);
      setExtraCost(exportData.extra_cost ?? 0);

          setTaxType(
        exportData.vat && exportData.vat > 0 ? 'vat' :
        exportData.pitRate && exportData.pitRate > 0 ? 'pitRate' : 'vat'
      );
      setVat(exportData.vat ?? 8);  // Default VAT
      setPitrate(exportData.pitRate ?? 1.5);  // Default PIT rate

      form.setFieldsValue({
        note: exportData.note,
        status: exportData.status,
        customerId: exportData.customerId,
        additional_cost: exportData.additional_cost ?? 0,
        extra_cost: exportData.extra_cost ?? 0,
        vat: exportData.vat ?? 8,
        pitRate: exportData.pitRate ?? 1.5,
        customerName: exportData.customer?.name,
        customerEmail: exportData.customer?.email,
        customerPhoneNumber: exportData.customer?.phoneNumber,
        customerMst: exportData.customer?.mst,
        customerAddress: exportData.customer?.address,
      });
    }
  }, [exportData, open, form]);

  useEffect(() => {
   if (status === 'REJECTED') {
      if (totalAmountData?.totalAmount) {
        setAdditionalCost(totalAmountData.totalAmount);
        form.setFieldsValue({
          additional_cost: totalAmountData.totalAmount, 
        });
      }
    }else {
        setAdditionalCost(0);
      setExtraCost(0);
      form.setFieldsValue({
        additional_cost: 0,
        extra_cost: 0,
      });
    }
  }, [totalAmountData, status, exportData]);


  const onFinish = async (values: any) => {
    try {
      const updatedCustomerData = {
        name: values.customerName,
        email: values.customerEmail,
        phoneNumber: values.customerPhoneNumber,
        mst: values.customerMst,
        address: values.customerAddress,
      };

      const oldCustomer = exportData?.customer;
      const isCustomerChanged =
        oldCustomer &&
        (
          oldCustomer.name !== updatedCustomerData.name ||
          oldCustomer.email !== updatedCustomerData.email ||
          oldCustomer.phoneNumber !== updatedCustomerData.phoneNumber ||
          oldCustomer.mst !== updatedCustomerData.mst ||
          oldCustomer.address !== updatedCustomerData.address
        );

      // ✅ Cập nhật thông tin khách hàng nếu có thay đổi
      if (isCustomerChanged) {
        await updateCustomerAsync({
          id: exportData?.customerId!,
          data: updatedCustomerData,
        });
        message.success('Cập nhật thông tin khách hàng thành công');
      }

      // ✅ Loại bỏ các trường liên quan đến khách hàng khỏi payload updateExport
      const {
        customerName,
        customerEmail,
        customerPhoneNumber,
        customerMst,
        customerAddress,
        ...cleanedValues
      } = values;

      await mutateAsync({
        id: exportData?.id!,
        data: {
          ...cleanedValues,
          status,
          customerId: selectedCustomer,
          additional_cost: additionalCost,
          extra_cost: extraCost,
          vat: taxType === 'vat' ? (values.vat ?? vat) : 0,
          pitRate: taxType === 'pitRate' ? (values.pitRate ?? pitRate) : 0,
          ...(applyLoyaltyPoint && {
            applyLoyaltyPoint: true,
            loyaltyPointUsed: applyLoyaltyPoint ? loyaltyPoint : 0,
            loyaltyPointAmount: applyLoyaltyPoint ? loyaltyPoint * 1000 : 0,
          }),
          ...(!applyLoyaltyPoint && {
            applyLoyaltyPoint: false,
          }),
        },
      });

      if (status === 'REJECTED') {
        if (exportData?.prepaymentId !== undefined) {  
          await updatePrepaymentStatus({
            id: exportData?.prepaymentId,  
            newStatus: 'CANCELLED',         
          });
          message.success('Cập nhật trạng thái Prepayment thành công');
        } else {
          message.error('Không tìm thấy Prepayment để cập nhật trạng thái.');
        }
      }

      message.success('Cập nhật báo giá thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const getStatusOptions = () => {
    if (currentUser?.role === 'superadmin') {
      const options = [
        { value: 'CANCELLED', label: 'Hủy' },
      ];

      if (exportData?.status === 'EXPORTED') {
        options.push({ value: 'REJECTED', label: 'Khách từ chối' });
      }

      return options;
    }

    if (currentUser?.role === 'admin') {
      if (exportData?.status === 'EXPORTED') {
        return [
          { value: 'PREPARED', label: 'Đã gửi hàng' },
        ];
      }

      if (exportData?.status === 'PENDING' || exportData?.status === 'CANCELLED') {
        return [
          { value: 'PENDING', label: 'Chờ xử lý' },
          { value: 'CANCELLED', label: 'Hủy' },
        ];
      }

      // Các trạng thái khác thì không cho thay đổi
      return [];
    }

    return [];
  };

  return (
    <Modal
      title="Cập nhật báo giá"
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
              <Input disabled />
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
            <Form.Item name="customerEmail" label="Email" rules={[
              { type: 'email', message: 'Email không hợp lệ' },
            ]}>
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

        <Form.Item label="Điểm thành viên">
          <Input value={loyaltyPoint} disabled />
          <Checkbox
            checked={applyLoyaltyPoint}
            onChange={(e) => setApplyLoyaltyPoint(e.target.checked)}
            style={{ marginLeft: 8 }}
          >
            Áp dụng điểm thành viên cho đơn báo giá này
          </Checkbox>
        </Form.Item>


        <Divider>Thông tin báo giá</Divider>

        <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
          <Select
            value={status}
            onChange={(val) => setStatus(val)}
            options={getStatusOptions()}
      
          />
        </Form.Item>

        <Form.Item label="Chọn loại thuế">
          <Select
            value={taxType}
            onChange={(val) => {
              setTaxType(val);
              // Sử dụng form.setFieldsValue để cập nhật giá trị mặc định khi chọn loại thuế
              if (val === 'vat') {
                form.setFieldsValue({ vat: vat || 8 });  // Đặt giá trị mặc định cho VAT
              } else if (val === 'pitRate') {
                form.setFieldsValue({ pitRate: pitRate || 1.5 });  // Đặt giá trị mặc định cho PIT
              }
            }}
          >
            <Select.Option value="vat">VAT</Select.Option>
            <Select.Option value="pitRate">Thuế TNCN</Select.Option>
          </Select>
        </Form.Item>

        {taxType === 'vat' && (
          <Form.Item name="vat" label="VAT (%)" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              max={100}
              step={0.1}
              style={{ width: '100%' }}
              placeholder="Nhập VAT (%)"
            />
          </Form.Item>
        )}

        {taxType === 'pitRate' && (
          <Form.Item name="pitRate" label="Thuế TNCN (%)" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              max={100}
              step={0.1}
              style={{ width: '100%' }}
              placeholder="Nhập Thuế TNCN (%)"
            />
          </Form.Item>
        )}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="additional_cost" label="Phí cộng thêm" rules={[{ required: true }]}>
              <InputNumber
              style={{ width: '100%' }}
                value={additionalCost} // Dùng state cho giá trị
                onChange={(value) => setAdditionalCost(value ?? 0)}
                placeholder="Nhập phí cộng thêm"
                disabled={status === 'REJECTED'}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
              />
            </Form.Item>  
          </Col>
          <Col span={12}>
            <Form.Item name="extra_cost" label="Phí phát sinh" rules={[{ required: true }]}>
              <InputNumber
              style={{ width: '100%' }}
               value={extraCost} // Dùng state cho giá trị
                onChange={(value) => setExtraCost(value ?? 0)}
                placeholder="Nhập phí phát sinh"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={3} placeholder="Nhập ghi chú báo giá" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isPending}>
            Cập nhật báo giá
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
