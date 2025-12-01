import React, { useEffect, useState } from 'react';
import { Modal, Table, Spin, message, Form, InputNumber, Button, Select, Space, Tooltip, Card, Input, Radio, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTransferDetailsByTransferId } from '@/hooks/transfer-detail/useTransferDetailsByTransferId';
import { useCreateTransferDetail } from '@/hooks/transfer-detail/useCreateTransferDetail';
import { useDeleteTransferDetail } from '@/hooks/transfer-detail/useDeleteTransferDetail';
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { useColorQuantityByProductId } from '@/hooks/product/useColorQuantityByProductId';
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
  const { mutateAsync: createDetail, isPending } = useCreateTransferDetail();
  const { mutateAsync: deleteDetail } = useDeleteTransferDetail();

  const [form] = Form.useForm();

  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<number | undefined>(undefined);
  const [selectedColorTitle, setSelectedColorTitle] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantityError, setQuantityError] = useState<string>('');
  const [isQuantityExceeded, setIsQuantityExceeded] = useState<boolean>(false);
  const [existingCombinations, setExistingCombinations] = useState<string[]>([]);
  const [currentStockQuantity, setCurrentStockQuantity] = useState<number>(0);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedProductId(undefined);
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize('');
      setQuantityError('');
      setIsQuantityExceeded(false);
      setExistingCombinations([]);
      setCurrentStockQuantity(0);
      setAvailableSizes([]);
      refetch();
    }
  }, [visible, form, refetch]);

  const { data: products, isLoading: isProductsLoading } = useAllProducts({});
  const { data: colorQuantities, isLoading: isColorLoading, refetch: refetchColorQuantities } = useColorQuantityByProductId(selectedProduct?.id);

  // 👈 HÀM LẤY SỐ LƯỢNG TỒN KHO THEO MÀU VÀ SIZE
  const getStockQuantity = (colorTitle: string, size: string): number => {
    if (!colorQuantities?.data) return 0;
    
    const stockItem = colorQuantities.data.find((item: any) => 
      item.colorTitle === colorTitle && item.size === size
    );
    
    return stockItem ? stockItem.remainingQuantity : 0;
  };

  // 👈 HÀM LẤY DANH SÁCH SIZE CÓ SẴN CHO MÀU ĐÃ CHỌN
  const getAvailableSizesForColor = (colorTitle: string): string[] => {
    if (!colorQuantities?.data || !colorTitle) return [];
    
    const availableSizes = colorQuantities.data
      .filter((item: any) => item.colorTitle === colorTitle && item.remainingQuantity > 0)
      .map((item: any) => item.size);
    
    return [...new Set(availableSizes)];
  };

  // 👈 CẬP NHẬT SỐ LƯỢNG TỒN KHO VÀ DANH SÁCH SIZE KHI MÀU HOẶC DỮ LIỆU THAY ĐỔI
  useEffect(() => {
    if (selectedColorTitle && selectedSize) {
      const stockQty = getStockQuantity(selectedColorTitle, selectedSize);
      setCurrentStockQuantity(stockQty);
      
      const currentQuantity = form.getFieldValue('quantity');
      if (currentQuantity && currentQuantity > stockQty) {
        // 👈 TỰ ĐỘNG ĐẶT LẠI GIÁ TRỊ BẰNG TỒN KHO TỐI ĐA
        form.setFieldsValue({ quantity: stockQty });
        setQuantityError('');
        setIsQuantityExceeded(false);
      } else {
        setQuantityError('');
        setIsQuantityExceeded(false);
      }
    } else {
      setCurrentStockQuantity(0);
      setQuantityError('');
      setIsQuantityExceeded(false);
    }
  }, [selectedColorTitle, selectedSize, colorQuantities]);

  useEffect(() => {
    if (selectedColorTitle) {
      const sizes = getAvailableSizesForColor(selectedColorTitle);
      setAvailableSizes(sizes);
      
      if (selectedSize && !sizes.includes(selectedSize)) {
        setSelectedSize('');
        form.setFieldsValue({ size: undefined });
      }
    } else {
      setAvailableSizes([]);
    }
  }, [selectedColorTitle, colorQuantities]);

  // 👈 REFETCH KHI CHỌN SIZE ĐỂ CẬP NHẬT DỮ LIỆU MỚI NHẤT
  const handleSizeChange = async (value: string) => {
    setSelectedSize(value);
    setQuantityError('');
    setIsQuantityExceeded(false);
    form.setFieldsValue({ quantity: undefined });
    
    if (selectedProduct?.id) {
      await refetchColorQuantities();
    }
  };

  // Chọn sản phẩm (Model)
  const onProductChange = (value: string) => {
    const product = products?.find((p) => p.sku === value);
    if (product) {
      setSelectedProduct(product);
      setSelectedProductId(product.id);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize('');
      setCurrentStockQuantity(0);
      setAvailableSizes([]);
      const unitPrice = transferData?.isInternal ? 0 : (product.discount || product.price || 0);
      form.setFieldsValue({
        productId: product.id,
        unitPrice: unitPrice,
        size: undefined,
        quantity: undefined,
      });
      setQuantityError('');
      setIsQuantityExceeded(false);

      const existingCombos = data
        ?.filter((detail: any) => detail.productId === product.id)
        .map((detail: any) => `${detail.colorTitle}-${detail.size}`);
      setExistingCombinations(existingCombos || []);
    }
  };

  // Chọn màu
  const onColorChange = async (value: any) => {
    const selectedColorData = selectedProduct?.colors?.find((c: any) => c.id === value);
    if (selectedColorData) {
      setSelectedColor(value);
      setSelectedColorTitle(selectedColorData.title || '');
      setQuantityError('');
      setIsQuantityExceeded(false);
      form.setFieldsValue({ 
        color: value,
        quantity: undefined,
      });
      
      if (selectedProduct?.id) {
        await refetchColorQuantities();
      }
    }
  };

  // 👈 HÀM XỬ LÝ NHẬP SỐ LƯỢNG - CHẶN HOÀN TOÀN VIỆC NHẬP LỚN HƠN TỒN KHO
  const handleQuantityChange = (value: number | null) => {
    if (value === null || value === undefined) {
      setQuantityError('');
      setIsQuantityExceeded(false);
      return;
    }

    if (value < 1) {
      setQuantityError('Số lượng phải lớn hơn 0');
      setIsQuantityExceeded(true);
      form.setFieldsValue({ quantity: 1 });
      return;
    }

    if (selectedColorTitle && selectedSize) {
      if (value > currentStockQuantity) {
        // 👈 KHÔNG CHO PHÉP NHẬP - TỰ ĐỘNG ĐẶT LẠI BẰNG TỒN KHO TỐI ĐA
        form.setFieldsValue({ quantity: currentStockQuantity });
        setQuantityError(`Số lượng tối đa là ${currentStockQuantity}`);
        setIsQuantityExceeded(true);
        message.warning(`Số lượng không được vượt quá ${currentStockQuantity}`);
      } else {
        setQuantityError('');
        setIsQuantityExceeded(false);
      }
    }
  };

  // 👈 HÀM XỬ LÝ ONBLUR - KIỂM TRA LẠI KHI RỜI KHỎI INPUT
  const handleQuantityBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = form.getFieldValue('quantity');
    if (value && selectedColorTitle && selectedSize && value > currentStockQuantity) {
      form.setFieldsValue({ quantity: currentStockQuantity });
      setQuantityError(`Số lượng tối đa là ${currentStockQuantity}`);
      setIsQuantityExceeded(true);
    }
  };

  // 👈 HÀM XỬ LÝ ONPRESSENTER - KIỂM TRA KHI NHẤN ENTER
  const handleQuantityPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = form.getFieldValue('quantity');
    if (value && selectedColorTitle && selectedSize && value > currentStockQuantity) {
      form.setFieldsValue({ quantity: currentStockQuantity });
      setQuantityError(`Số lượng tối đa là ${currentStockQuantity}`);
      setIsQuantityExceeded(true);
      e.preventDefault();
    }
  };

  const quantityValidator = (_: any, value: number) => {
    if (!value || value < 1) {
      return Promise.reject(new Error('Số lượng phải lớn hơn 0'));
    }
    if (value > currentStockQuantity) {
      return Promise.reject(new Error(`Số lượng không được vượt quá ${currentStockQuantity}`));
    }
    return Promise.resolve();
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
      message.error('Vui lòng chọn màu hoặc size');
      return;
    }

    let finalColorTitle = '';
    if (values.color) {
      const finalColorData = selectedProduct?.colors?.find((c: any) => c.id === values.color);
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

    if (values.quantity > currentStockQuantity) {
      message.error(`Số lượng nhập vào (${values.quantity}) lớn hơn số lượng còn lại trong kho (${currentStockQuantity})`);
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
      setCurrentStockQuantity(0);
      setAvailableSizes([]);
      setQuantityError('');
      setIsQuantityExceeded(false);
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
                    setCurrentStockQuantity(0);
                    setAvailableSizes([]);
                    const unitPrice = transferData?.isInternal ? 0 : (product.discount || product.price || 0);
                    form.setFieldsValue({
                      sku: product.sku,
                      productId: product.id,
                      unitPrice,
                      size: undefined,
                      quantity: undefined,
                    });
                    setQuantityError('');
                    setIsQuantityExceeded(false);

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

            {selectedProduct && selectedProduct.colors?.length > 0 && (
              <Form.Item label="Chọn màu" name="color">
                {isColorLoading ? (
                  <Spin size="small" />
                ) : (
                  <Radio.Group
                    value={selectedColor}
                    onChange={(e) => onColorChange(e.target.value)}
                  >
                    {selectedProduct.colors
                      .map((color: any) => {
                        const availableSizesForThisColor = getAvailableSizesForColor(color.title);
                        const hasAvailableSizes = availableSizesForThisColor.length > 0;
                        
                        return (
                          <Radio.Button
                            key={color.id}
                            value={color.id}
                            disabled={!hasAvailableSizes}
                          >
                            {color.title} {!hasAvailableSizes && '(Hết hàng)'}
                          </Radio.Button>
                        );
                      })}
                  </Radio.Group>
                )}
              </Form.Item>
            )}

            {/* 👈 HIỂN THỊ SỐ LƯỢNG TỒN KHO HIỆN TẠI */}
            {(selectedColor || selectedSize) && (
              <div style={{ marginBottom: 16 }}>
                <Text>Số lượng tồn kho hiện tại: </Text>
                <Text strong type={currentStockQuantity > 0 ? 'success' : 'danger'}>
                  {currentStockQuantity}
                </Text>
                {colorQuantities?.totalQuantity && (
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    (Tổng tồn kho: {colorQuantities.totalQuantity})
                  </Text>
                )}
              </div>
            )}

            {/* Form select cho size - CHỈ HIỂN THỊ CÁC SIZE CÓ SẴN */}
            <Form.Item label="Size" name="size">
              <Select
                placeholder={availableSizes.length > 0 ? "Chọn size" : "Chọn màu trước"}
                onChange={handleSizeChange}
                value={selectedSize}
                disabled={status === 'CANCELLED' || !selectedColorTitle}
                allowClear
                loading={isColorLoading}
              >
                {availableSizes.map((size: string) => {
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
                {availableSizes.length === 0 && selectedColorTitle && (
                  <Select.Option value="" disabled>
                    Không có size nào có sẵn
                  </Select.Option>
                )}
              </Select>
              {selectedColorTitle && availableSizes.length === 0 && (
                <Text type="danger" style={{ fontSize: '12px', marginTop: '4px' }}>
                  Màu này không có size nào có sẵn trong kho
                </Text>
              )}
            </Form.Item>

            {(selectedColor || selectedSize) && (
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng' },
                  { validator: quantityValidator }
                ]}
                validateStatus={quantityError ? 'error' : ''}
                help={quantityError || ''}
              >
                <InputNumber
                  placeholder={`Nhập số lượng (tối đa: ${currentStockQuantity})`}
                  min={1}
                  max={currentStockQuantity}
                  style={{ width: '100%' }}
                  onChange={handleQuantityChange}
                  onBlur={handleQuantityBlur}
                  onPressEnter={handleQuantityPressEnter}
                  disabled={status === 'CANCELLED' || currentStockQuantity === 0}
                  step={1}
                  precision={0}
                  controls={true}
                />
              </Form.Item>
            )}

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
                disabled={isQuantityExceeded || status === 'CANCELLED' || currentStockQuantity === 0}
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