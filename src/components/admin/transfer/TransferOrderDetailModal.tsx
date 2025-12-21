'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Table, Spin, message, Form, InputNumber, Button, Select, Space, Tooltip, Card, Input, Radio, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTransferOrderDetailsByTransferId } from '@/hooks/transfer-order-detail/useTransferOrderDetailsByTransferId';
import { useCreateTransferOrderDetail } from '@/hooks/transfer-order-detail/useCreateTransferOrderDetail';
import { useDeleteTransferOrderDetail } from '@/hooks/transfer-order-detail/useDeleteTransferOrderDetail';
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { useAllColors } from '@/hooks/color/useAllColors';
import { formatVND } from '@/utils/helpers';
import { Transfer } from '@/types/transfer.type';

const { Text } = Typography;

interface TransferOrderDetailModalProps {
  visible: boolean;
  transferId: number;
  transferData: Transfer | null;
  onClose: () => void;
  refetchTransfer: () => void;
  status: string;
}

const TransferOrderDetailModal: React.FC<TransferOrderDetailModalProps> = ({ visible, transferId, transferData, onClose, refetchTransfer, status }) => {
  const { data, isLoading, refetch } = useTransferOrderDetailsByTransferId(transferId);

    console.log("data", data)
  const { mutateAsync: createDetail, isPending } = useCreateTransferOrderDetail();
  const { mutateAsync: deleteDetail } = useDeleteTransferOrderDetail();

  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<number | undefined>(undefined);
  const [selectedColorTitle, setSelectedColorTitle] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [existingCombinations, setExistingCombinations] = useState<string[]>([]);

  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  const { data: products, isLoading: isProductsLoading } = useAllProducts({});
  const { data: colors, isLoading: isColorsLoading } = useAllColors({});

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize('');
      setExistingCombinations([]);
      refetch();
    }
  }, [visible, form, refetch]);

  const onProductChange = (value: string) => {
    const product = products?.find((p) => p.sku === value);
    if (product) {
      setSelectedProduct(product);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize('');
      const unitPrice = transferData?.isInternal ? 0 : (product.discount || product.price || 0);
      form.setFieldsValue({ productId: product.id, unitPrice, size: undefined, quantity: undefined });

      const existingCombos = data?.filter((d: any) => d.productId === product.id)
        .map((d: any) => `${d.colorTitle}-${d.size}`);
      setExistingCombinations(existingCombos || []);
    }
  };

  const onColorChange = (value: any) => {
    const color = colors?.find((c: any) => c.id === value);
    if (color) {
      setSelectedColor(value);
      setSelectedColorTitle(color.title || '');
      form.setFieldsValue({ color: value, quantity: undefined });
    }
  };

  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
    form.setFieldsValue({ quantity: undefined });
  };

  const columns = [
    { title: 'Tên sản phẩm', key: 'productTitle', render: (_text: any, record: any) => record.product?.title || '-' },
    { title: 'Model', dataIndex: 'sku', render: (_text: any, record: any) => record.product?.sku || '-' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    { title: 'ĐV', dataIndex: 'unit', key: 'unit' },
    { title: 'Màu', dataIndex: 'colorTitle', key: 'colorTitle' },
    { title: 'Size', dataIndex: 'size', key: 'size', render: (size: string) => size || '-' },
    { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: any) => formatVND(v) },
    { title: 'Thành tiền', dataIndex: 'finalPrice', key: 'finalPrice', render: (v: any) => formatVND(v) },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note', render: (note: any) => note || '-' },
    ...(status !== 'TRANSFERRED' && status !== 'COMPLETED' ? [{
      title: 'Hành động',
      key: 'action',
      render: (_text: any, record: any) => (
        <Space>
          <Tooltip title="Xoá">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá',
                  content: 'Bạn có chắc chắn muốn xoá chi tiết sản phẩm này?',
                  onOk: async () => {
                    try { await deleteDetail(record.id); message.success('Xoá thành công'); refetch(); }
                    catch { message.error('Xoá thất bại'); }
                  }
                });
              }}
            />
          </Tooltip>
        </Space>
      )
    }] : [])
  ];

const onFinish = async (values: any) => {
  if (!selectedProduct) return message.error('Vui lòng chọn sản phẩm');
  if (!selectedColor || !selectedSize) return message.error('Vui lòng chọn màu và size');

  const combinationKey = `${selectedColorTitle}-${selectedSize}`;
  if (existingCombinations.includes(combinationKey)) {
    return message.error(`Sản phẩm này với màu và size đã tồn tại`);
  }

  if (!values.quantity || values.quantity < 1) return message.error('Số lượng phải > 0');

  // Tính unitPrice: nếu là chuyển nội bộ thì 0, nếu không thì lấy từ form (người dùng nhập) hoặc fallback từ product
  const unitPrice = transferData?.isInternal 
    ? 0 
    : (values.unitPrice ?? selectedProduct.discount ?? selectedProduct.price ?? 0);

  try {
    await createDetail({
      transferId,
      productId: selectedProduct.id,
      color: selectedColor,
      colorTitle: selectedColorTitle,
      size: selectedSize,
      quantity: values.quantity,
      unit: selectedProduct.unit,
      unitPrice, // ← Thêm trường này
      note: values.note || null,
    });

    message.success('Thêm chi tiết thành công');
    form.resetFields();
    setSelectedProduct(null);
    setSelectedColor(undefined);
    setSelectedColorTitle('');
    setSelectedSize('');
    setExistingCombinations([]);
    refetch();
    refetchTransfer();
  } catch (error: any) {
    message.error(error?.response?.data?.message || 'Lỗi khi thêm chi tiết');
  }
};

  return (
    <Modal
      visible={visible}
      title="Chi tiết đơn xuất kho"
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      {status !== 'TRANSFERRED' && status !== 'COMPLETED' && (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Card title="Thêm sản phẩm" style={{ marginBottom: 20 }}>
            <Form.Item label="Model" name="sku" rules={[{ required: true }]}>
              <Select
                showSearch
                placeholder="Chọn Model"
                loading={isProductsLoading}
                onChange={onProductChange}
                value={selectedProduct?.sku || undefined}
              >
                {products?.map((p: any) => <Select.Option key={p.id} value={p.sku}>{p.sku}</Select.Option>)}
              </Select>
            </Form.Item>

            <Form.Item label="Tên sản phẩm">
              <Select
                showSearch
                placeholder="Chọn tên sản phẩm"
                loading={isProductsLoading}
                value={selectedProduct?.title || undefined}
                onChange={(val) => onProductChange(val)}
              >
                {products?.map((p: any) => <Select.Option key={p.id} value={p.title}>{p.title}</Select.Option>)}
              </Select>
            </Form.Item>

            <Form.Item label="Đơn vị tính">
              <Input value={selectedProduct?.unit || ''} disabled />
            </Form.Item>

            <Form.Item label="Chọn màu" name="color" rules={[{ required: true }]}>
              {isColorsLoading ? <Spin size="small" /> :
                <Radio.Group value={selectedColor} onChange={(e) => onColorChange(e.target.value)}>
                  {colors?.map((c: any) => <Radio.Button key={c.id} value={c.id}>{c.title}</Radio.Button>)}
                </Radio.Group>
              }
            </Form.Item>

            <Form.Item label="Size" name="size" rules={[{ required: true }]}>
              <Select placeholder="Chọn size" onChange={handleSizeChange} value={selectedSize}>
                {defaultSizes.map((size) => {
                  const key = `${selectedColorTitle}-${size}`;
                  const disabled = existingCombinations.includes(key);
                  return <Select.Option key={size} value={size} disabled={disabled}>{size} {disabled && '(Đã thêm)'}</Select.Option>;
                })}
              </Select>
            </Form.Item>

            <Form.Item label="Số lượng" name="quantity" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

              <Form.Item label="Đơn giá" name="unitPrice" rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}>
                          <InputNumber
                            placeholder="Nhập đơn giá"
                            min={0}
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                            disabled={status === 'CANCELLED' || transferData?.isInternal}
                          />
                        </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isPending} block>Thêm sản phẩm</Button>
            </Form.Item>
          </Card>
        </Form>
      )}

      <Table
        loading={isLoading}
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
      />
    </Modal>
  );
};

export default TransferOrderDetailModal;
