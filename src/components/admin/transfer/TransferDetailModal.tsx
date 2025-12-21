import React, { useEffect, useState } from 'react';
import { Modal, Table, Spin, message, Form, InputNumber, Button, Select, Space, Tooltip, Card, Input, Radio, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTransferDetailsByTransferId } from '@/hooks/transfer-detail/useTransferDetailsByTransferId';
import { useCreateTransferDetail } from '@/hooks/transfer-detail/useCreateTransferDetail';
import { useDeleteTransferDetail } from '@/hooks/transfer-detail/useDeleteTransferDetail';
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { useAllColors } from '@/hooks/color/useAllColors';
import { formatVND } from '@/utils/helpers';
import { Transfer } from '@/types/transfer.type';

const { Text } = Typography;

interface TransferDetailModalProps {
  visible: boolean;
  transferId: number;
  transferData: Transfer | null;
  onClose: () => void;
  refetchTransfer: () => void;
  status: string;
}

const TransferDetailModal: React.FC<TransferDetailModalProps> = ({ visible, transferId, transferData, onClose, refetchTransfer, status }) => {
  const { data, isLoading, refetch } = useTransferDetailsByTransferId(transferId);

    console.log("data", data)
  const { mutateAsync: createDetail, isPending } = useCreateTransferDetail();
  const { mutateAsync: deleteDetail } = useDeleteTransferDetail();

  const [form] = Form.useForm();

  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<number | undefined>(undefined);
  const [selectedColorTitle, setSelectedColorTitle] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [existingCombinations, setExistingCombinations] = useState<string[]>([]);

  // Danh sách size mặc định
  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedProductId(undefined);
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize('');
      setExistingCombinations([]);
      refetch();
    }
  }, [visible, form, refetch]);

  const { data: products, isLoading: isProductsLoading } = useAllProducts({});
  const { data: colors, isLoading: isColorsLoading } = useAllColors({});

  // Chọn sản phẩm (Model)
  const onProductChange = (value: string) => {
    const product = products?.find((p) => p.sku === value);
    if (product) {
      setSelectedProduct(product);
      setSelectedProductId(product.id);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize('');
      const unitPrice = transferData?.isInternal ? 0 : (product.discount || product.price || 0);
      form.setFieldsValue({
        productId: product.id,
        unitPrice: unitPrice,
        size: undefined,
        quantity: undefined,
      });

      // Lấy danh sách các kết hợp màu-size đã tồn tại cho sản phẩm này
      const existingCombos = data
        ?.filter((detail: any) => detail.productId === product.id)
        .map((detail: any) => `${detail.colorTitle}-${detail.size}`);
      setExistingCombinations(existingCombos || []);
    }
  };

  // Chọn màu
  const onColorChange = (value: any) => {
    const selectedColorData = colors?.find((c: any) => c.id === value);
    if (selectedColorData) {
      setSelectedColor(value);
      setSelectedColorTitle(selectedColorData.title || '');
      form.setFieldsValue({ 
        color: value,
        quantity: undefined,
      });
    }
  };

  // Chọn size
  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
    form.setFieldsValue({ quantity: undefined });
  };

  const columns = [
    {
      title: 'Tên sản phẩm',
      key: 'productTitle',
      render: (_text: any, record: any) => record.product?.title || '-',
    },
    {
      title: 'Model',
      dataIndex: 'sku',
      render: (_text: any, record: any) => record.product?.sku || '-',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'ĐV',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Màu',
      dataIndex: 'colorTitle',
      key: 'colorTitle',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: string) => size || '-',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (unitPrice: any) => formatVND(unitPrice),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'finalPrice',
      key: 'finalPrice',
      render: (finalPrice: any) => formatVND(finalPrice),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note: any) => note || '-',
    },
    ...(status !== 'TRANSFERRED' && status !== 'COMPLETED' ? [{
      title: 'Hành động',
      key: 'action',
      render: (_text: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Xoá">
            <DeleteOutlined
              style={{
                color: 'red',
                cursor: (status === 'CANCELLED' || status === 'TRANSFERRED' || status === 'COMPLETED') ? 'not-allowed' : 'pointer',
              }}
              onClick={() => {
                if (status !== 'CANCELLED' && status !== 'TRANSFERRED' && status !== 'COMPLETED') {
                  Modal.confirm({
                    title: 'Xác nhận xoá sản phẩm',
                    content: `Bạn có chắc chắn muốn xoá sản phẩm khỏi đơn xuất kho này không?`,
                    okText: 'Xoá',
                    okType: 'danger',
                    cancelText: 'Hủy',
                    onOk: async () => {
                      try {
                        await deleteDetail(record.id);
                        message.success('Xoá chi tiết sản phẩm thành công');
                        refetch();
                      } catch {
                        message.error('Xoá thất bại');
                      }
                    },
                  });
                }
              }}
              disabled={status === 'CANCELLED' || status === 'TRANSFERRED' || status === 'COMPLETED'}
            />
          </Tooltip>
        </Space>
      ),
    }] : []),
  ];

  // Thêm mới chi tiết
  const onFinish = async (values: any) => {
    if (!values.sku) {
      message.error('Vui lòng chọn Model');
      return;
    }

    const productId = Number(selectedProduct?.id);
    if (!productId || isNaN(productId)) {
      message.error('Vui lòng chọn sản phẩm');
      return;
    }

    if (!values.color && !selectedSize) {
      message.error('Vui lòng chọn màu và size');
      return;
    }

    let finalColorTitle = '';
    if (values.color) {
      const finalColorData = colors?.find((c: any) => c.id === values.color);
      if (!finalColorData) {
        message.error('Màu đã chọn không hợp lệ.');
        return;
      }
      finalColorTitle = finalColorData.title;
    }

    const combinationKey = `${finalColorTitle}-${selectedSize}`;
    const isCombinationExist = existingCombinations.includes(combinationKey);

    if (isCombinationExist) {
      message.error(`Sản phẩm '${selectedProduct?.title}' với màu '${finalColorTitle}' và size '${selectedSize}' đã tồn tại trong đơn xuất kho này.`);
      return;
    }

    if (!values.quantity || values.quantity < 1) {
      message.error('Số lượng phải lớn hơn 0');
      return;
    }

    const { sku, ...valueWithoutSku } = values;

    try {
      await createDetail({
        ...valueWithoutSku,
        transferId,
        productId,
        colorTitle: finalColorTitle,
        size: selectedSize,
        unit: selectedProduct?.unit || '',
      });
      message.success('Thêm chi tiết đơn xuất kho thành công');
      
      form.resetFields();
      setSelectedProductId(undefined);
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize('');
      setExistingCombinations([]);
      
      refetch();
      refetchTransfer();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi khi thêm chi tiết đơn xuất kho');
    }
  };

  return (
    <Modal
      visible={visible}
      title={
        <>
          Chi tiết đơn xuất kho
          <div className='text-base' style={{ marginTop: 4 }}>
            <Text type={transferData?.isInternal === true ? 'warning' : 'success'}>
              {transferData?.isInternal === true ? 'Xuất kho nội bộ' : 'Xuất kho bán hàng'}
            </Text>
          </div>
        </>
      }
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      {status !== 'TRANSFERRED' && status !== 'COMPLETED' && (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Card title="Thêm sản phẩm" bordered={true} style={{ marginBottom: 20 }}>
            <Form.Item label="Model" name="sku" rules={[{ required: true, message: 'Vui lòng chọn Model' }]}>
              <Select
                showSearch
                placeholder="Chọn Model"
                loading={isProductsLoading}
                optionFilterProp="children"
                filterOption={(input, option) => {
                  if (!option || !option.children) return false;
                  const optionLabel = typeof option.children === 'string' ? option.children : '';
                  return optionLabel.toLowerCase().includes(input.toLowerCase());
                }}
                disabled={status === 'CANCELLED'}
                allowClear
                onChange={onProductChange}
                value={selectedProduct?.sku || ''}
              >
                {products?.map((product: any) => (
                  <Select.Option key={product.id} value={product.sku}>
                    {product.sku}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Tên sản phẩm">
              <Select
                showSearch
                placeholder="Chọn tên sản phẩm"
                loading={isProductsLoading}
                optionFilterProp="children"
                filterOption={(input, option) => {
                  if (!option || !option.children) return false;
                  const optionLabel = typeof option.children === 'string' ? option.children : '';
                  return optionLabel.toLowerCase().includes(input.toLowerCase());
                }}
                disabled={status === 'CANCELLED'}
                allowClear
                onChange={(value) => {
                  const product = products?.find((p) => p.title === value);
                  if (product) {
                    setSelectedProduct(product);
                    setSelectedProductId(product.id);
                    setSelectedColor(undefined);
                    setSelectedColorTitle('');
                    setSelectedSize('');
                    const unitPrice = transferData?.isInternal ? 0 : (product.discount || product.price || 0);
                    form.setFieldsValue({
                      sku: product.sku,
                      productId: product.id,
                      unitPrice,
                      size: undefined,
                      quantity: undefined,
                    });

                    const existingCombos = data
                      ?.filter((detail: any) => detail.productId === product.id)
                      .map((detail: any) => `${detail.colorTitle}-${detail.size}`);
                    setExistingCombinations(existingCombos || []);
                  } else {
                    setSelectedProduct(null);
                    setSelectedProductId(undefined);
                    form.setFieldsValue({
                      sku: undefined,
                      productId: undefined,
                      unitPrice: undefined,
                      size: undefined,
                      quantity: undefined,
                    });
                    setExistingCombinations([]);
                  }
                }}
                value={selectedProduct?.title || undefined}
              >
                {products?.map((product: any) => (
                  <Select.Option key={product.id} value={product.title}>
                    {product.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Đơn vị tính">
              <Input  
                placeholder="Đơn vị tính"
                value={selectedProduct?.unit || ''}
                disabled
              />
            </Form.Item>

            {/* Chọn màu từ danh sách tất cả màu */}
            <Form.Item label="Chọn màu" name="color" rules={[{ required: true, message: 'Vui lòng chọn màu' }]}>
              {isColorsLoading ? (
                <Spin size="small" />
              ) : (
                <Radio.Group
                  value={selectedColor}
                  onChange={(e) => onColorChange(e.target.value)}
                >
                  {colors?.map((color: any) => (
                    <Radio.Button key={color.id} value={color.id}>
                      {color.title}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              )}
            </Form.Item>

            {/* Chọn size */}
            <Form.Item label="Size" name="size" rules={[{ required: true, message: 'Vui lòng chọn size' }]}>
              <Select
                placeholder="Chọn size"
                onChange={handleSizeChange}
                value={selectedSize}
                disabled={status === 'CANCELLED' || !selectedColor}
                allowClear
              >
                {defaultSizes.map((size: string) => {
                  const combinationKey = `${selectedColorTitle}-${size}`;
                  const isSizeAlreadyAdded = existingCombinations.includes(combinationKey);
                  
                  return (
                    <Select.Option 
                      key={size} 
                      value={size}
                      disabled={isSizeAlreadyAdded}
                    >
                      {size} {isSizeAlreadyAdded && '(Đã thêm)'}
                    </Select.Option>
                  );
                })}
                {/* Option nhập size tùy chỉnh */}
                <Select.Option value="custom">+ Nhập size khác</Select.Option>
              </Select>
            </Form.Item>

            {/* Input nhập size tùy chỉnh */}
            {selectedSize === 'custom' && (
              <Form.Item 
                label="Nhập size" 
                name="customSize"
                rules={[{ required: true, message: 'Vui lòng nhập size' }]}
              >
                <Input 
                  placeholder="Nhập size tùy chỉnh"
                  disabled={status === 'CANCELLED'}
                  onChange={(e) => {
                    setSelectedSize(e.target.value);
                    form.setFieldsValue({ size: e.target.value });
                  }}
                />
              </Form.Item>
            )}

            <Form.Item
              label="Số lượng"
              name="quantity"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng' },
                { 
                  type: 'number',
                  min: 1,
                  message: 'Số lượng phải lớn hơn 0'
                }
              ]}
            >
              <InputNumber
                placeholder="Nhập số lượng"
                min={1}
                style={{ width: '100%' }}
                disabled={status === 'CANCELLED'}
                step={1}
                precision={0}
                controls={true}
              />
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
              <Input.TextArea rows={3} disabled={status === 'CANCELLED'} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                disabled={status === 'CANCELLED'}
                block
              >
                Thêm sản phẩm
              </Button>
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

export default TransferDetailModal;