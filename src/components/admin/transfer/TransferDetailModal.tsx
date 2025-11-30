import React, { useEffect, useState } from 'react';
import { Modal, Table, Spin, message, Form, InputNumber, Button, Select, Space, Tooltip, Card, Input, Radio, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTransferDetailsByTransferId } from '@/hooks/transfer-detail/useTransferDetailsByTransferId';
import { useCreateTransferDetail } from '@/hooks/transfer-detail/useCreateTransferDetail';
import { useDeleteTransferDetail } from '@/hooks/transfer-detail/useDeleteTransferDetail';
import { useUpdateTransferDetail } from '@/hooks/transfer-detail/useUpdateTransferDetail';
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { useColorQuantityByProductId } from '@/hooks/product/useColorQuantityByProductId';
import { formatVND } from '@/utils/helpers';
import { Transfer } from '@/types/transfer.type';
import { PRODUCT_SIZES } from '@/enums/size.enum';

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
  const { mutateAsync: updateDetail } = useUpdateTransferDetail();

  const [form] = Form.useForm();

  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<number | undefined>(undefined);
  const [selectedColorTitle, setSelectedColorTitle] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantityError, setQuantityError] = useState<string>('');
  const [isQuantityExceeded, setIsQuantityExceeded] = useState<boolean>(false);
  const [existingColorsForSelectedProduct, setExistingColorsForSelectedProduct] = useState<string[]>([]);
  const [currentStockQuantity, setCurrentStockQuantity] = useState<number>(0); // 👈 THÊM STATE ĐỂ LƯU SỐ LƯỢNG TỒN KHO HIỆN TẠI

  useEffect(() => {
    if (visible) {
      setSelectedDetail(null);
      form.resetFields();
      setSelectedProductId(undefined);
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize('');
      setQuantityError('');
      setIsQuantityExceeded(false);
      setExistingColorsForSelectedProduct([]);
      setCurrentStockQuantity(0); // 👈 RESET SỐ LƯỢNG TỒN KHO
      refetch();
    }
  }, [visible, form, refetch]);

  const { data: products, isLoading: isProductsLoading } = useAllProducts({});
  const { data: colorQuantities, isLoading: isColorLoading } = useColorQuantityByProductId(selectedProduct?.id);

  // 👈 HÀM LẤY SỐ LƯỢNG TỒN KHO THEO MÀU VÀ SIZE
  const getStockQuantity = (colorTitle: string, size: string): number => {
    if (!colorQuantities?.data) return 0;
    
    // Tìm số lượng tồn kho theo màu
    const colorQuantity = colorQuantities.data.find((item: any) => item.colorTitle === colorTitle);
    if (!colorQuantity) return 0;

    // Nếu có size, cần logic để lấy số lượng theo size
    // Giả sử bạn có API hoặc logic để lấy số lượng theo màu và size
    // Tạm thời trả về số lượng tồn kho của màu (cần cập nhật theo logic thực tế)
    return colorQuantity.remainingQuantity;
  };

  // 👈 CẬP NHẬT SỐ LƯỢNG TỒN KHO KHI MÀU HOẶC SIZE THAY ĐỔI
  useEffect(() => {
    if (selectedColorTitle || selectedSize) {
      const stockQty = getStockQuantity(selectedColorTitle, selectedSize);
      setCurrentStockQuantity(stockQty);
      
      // Kiểm tra lại số lượng đã nhập nếu có
      const currentQuantity = form.getFieldValue('quantity');
      if (currentQuantity && currentQuantity > stockQty) {
        setQuantityError(`Số lượng nhập vào (${currentQuantity}) lớn hơn số lượng còn lại trong kho (${stockQty})`);
        setIsQuantityExceeded(true);
      } else {
        setQuantityError('');
        setIsQuantityExceeded(false);
      }
    }
  }, [selectedColorTitle, selectedSize, colorQuantities]);

  // Chọn sản phẩm (Model)
  const onProductChange = (value: string) => {
    const product = products?.find((p) => p.sku === value);
    if (product) {
      setSelectedProduct(product);
      setSelectedProductId(product.id);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize('');
      setCurrentStockQuantity(0); // 👈 RESET SỐ LƯỢNG TỒN KHO
      const unitPrice = transferData?.isInternal ? 0 : (product.discount || product.price || 0);
      form.setFieldsValue({
        productId: product.id,
        unitPrice: unitPrice,
        size: undefined,
      });
      setQuantityError('');
      setIsQuantityExceeded(false);

      // Lấy màu đã tồn tại trong chi tiết đơn chuyển với sản phẩm này
      const existingColors = data
        ?.filter((detail: any) => detail.productId === product.id)
        .map((detail: any) => detail.colorTitle)
        .filter((color: string) => color);
      setExistingColorsForSelectedProduct(existingColors || []);
    }
  };

  // Chọn màu
  const onColorChange = (value: any) => {
    const selectedColorData = selectedProduct?.colors?.find((c: any) => c.id === value);
    if (selectedColorData) {
      setSelectedColor(value);
      setSelectedColorTitle(selectedColorData.title || '');
      setQuantityError('');
      setIsQuantityExceeded(false);
      form.setFieldsValue({ color: value });
      
      // 👈 CẬP NHẬT SỐ LƯỢNG TỒN KHO KHI CHỌN MÀU
      const stockQty = getStockQuantity(selectedColorData.title, selectedSize);
      setCurrentStockQuantity(stockQty);
    }
  };

  // Handle size change
  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
    setQuantityError('');
    setIsQuantityExceeded(false);
    
    // 👈 CẬP NHẬT SỐ LƯỢNG TỒN KHO KHI CHỌN SIZE
    const stockQty = getStockQuantity(selectedColorTitle, value);
    setCurrentStockQuantity(stockQty);
  };

  // Kiểm tra số lượng nhập vào có vượt quá tồn kho không
  const handleQuantityChange = (value: number | null) => {
    if (value === null) {
      setQuantityError('');
      setIsQuantityExceeded(false);
      return;
    }

    if (selectedColorTitle || selectedSize) {
      // 👈 SỬ DỤNG currentStockQuantity ĐÃ ĐƯỢC TÍNH TOÁN
      if (value > currentStockQuantity) {
        setQuantityError(`Số lượng nhập vào (${value}) lớn hơn số lượng còn lại trong kho (${currentStockQuantity})`);
        setIsQuantityExceeded(true);
        form.setFields([{ 
          name: 'quantity', 
          errors: [`Số lượng nhập vào (${value}) lớn hơn số lượng còn lại trong kho (${currentStockQuantity})`] 
        }]);
      } else {
        setQuantityError('');
        setIsQuantityExceeded(false);
        form.setFields([{ name: 'quantity', errors: [] }]);
      }
    }
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

    // Kiểm tra ít nhất màu hoặc size phải được chọn
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

    // Kiểm tra trùng lặp theo cả màu và size
    const isCombinationExist = data?.some((detail: any) =>
      detail.productId === productId &&
      detail.colorTitle === finalColorTitle &&
      detail.size === selectedSize &&
      (!selectedDetail || selectedDetail.id !== detail.id)
    );

    if (isCombinationExist) {
      message.error(`Sản phẩm '${selectedProduct?.title}' với màu '${finalColorTitle}' và size '${selectedSize}' đã tồn tại trong đơn xuất kho này.`);
      return;
    }

    // 👈 KIỂM TRA TỒN KHO VỚI SỐ LƯỢNG ĐÃ TÍNH TOÁN
    if (values.quantity > currentStockQuantity) {
      message.error(`Số lượng nhập vào (${values.quantity}) lớn hơn số lượng còn lại trong kho (${currentStockQuantity})`);
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
      setCurrentStockQuantity(0); // 👈 RESET SỐ LƯỢNG TỒN KHO
      setQuantityError('');
      setIsQuantityExceeded(false);
      setExistingColorsForSelectedProduct([]);
      refetch();
      refetchTransfer();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi khi thêm chi tiết đơn xuất kho');
    }
  };

  // Cập nhật chi tiết
  const onEditFinish = async (values: any) => {
    if (!selectedDetail) {
      message.error('Chi tiết cần cập nhật không hợp lệ');
      return;
    }
    try {
      await updateDetail({
        id: selectedDetail.id,
        data: {
          ...values,
          size: selectedSize,
        },
      });
      message.success('Cập nhật chi tiết đơn xuất kho thành công');
      refetch();
      refetchTransfer();
      setSelectedDetail(null);
      form.resetFields();
      setSelectedProductId(undefined);
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize('');
      setCurrentStockQuantity(0); // 👈 RESET SỐ LƯỢNG TỒN KHO
      setQuantityError('');
      setIsQuantityExceeded(false);
      setExistingColorsForSelectedProduct([]);
    } catch {
      message.error('Cập nhật chi tiết đơn xuất kho thất bại');
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
          onFinish={selectedDetail ? onEditFinish : onFinish}
        >
          <Card title="Chi Tiết sản phẩm" bordered={true} style={{ marginBottom: 20 }}>
            <Form.Item label="Model" name="sku" rules={[{ required: true, message: 'Vui lòng chọn Model' }]}>
              {selectedDetail ? (
                <div>{selectedDetail.product?.sku}</div>
              ) : (
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
              )}
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
                    setCurrentStockQuantity(0); // 👈 RESET SỐ LƯỢNG TỒN KHO
                    const unitPrice = transferData?.isInternal ? 0 : (product.discount || product.price || 0);
                    form.setFieldsValue({
                      sku: product.sku,
                      productId: product.id,
                      unitPrice,
                      size: undefined,
                    });
                    setQuantityError('');
                    setIsQuantityExceeded(false);

                    const existingColors = data
                      ?.filter((detail: any) => detail.productId === product.id)
                      .map((detail: any) => detail.colorTitle)
                      .filter((color: string) => color);
                    setExistingColorsForSelectedProduct(existingColors || []);
                  } else {
                    setSelectedProduct(null);
                    setSelectedProductId(undefined);
                    form.setFieldsValue({
                      sku: undefined,
                      productId: undefined,
                      unitPrice: undefined,
                      size: undefined,
                    });
                    setExistingColorsForSelectedProduct([]);
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

            {/* Form select cho size */}
            <Form.Item label="Size" name="size">
              <Select
                placeholder="Chọn size"
                onChange={handleSizeChange}
                value={selectedSize}
                disabled={status === 'CANCELLED'}
                allowClear
              >
                {PRODUCT_SIZES.map((size: any) => (
                  <Select.Option key={size} value={size}>
                    {size}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {!selectedDetail && selectedProduct && selectedProduct.colors?.length > 0 && (
              <Form.Item label="Chọn màu" name="color">
                {isColorLoading ? (
                  <Spin size="small" />
                ) : (
                  <>
                    <Radio.Group
                      value={selectedColor}
                      onChange={(e) => onColorChange(e.target.value)}
                    >
                      {selectedProduct.colors
                        .map((color: any) => {
                          const stockQty = getStockQuantity(color.title, selectedSize);
                          const isColorAlreadyAdded = existingColorsForSelectedProduct.includes(color.title);
                          return (
                            <Radio.Button
                              key={color.id}
                              value={color.id}
                              disabled={stockQty <= 0 || isColorAlreadyAdded}
                            >
                              {color.title} - Số lượng trong kho: {stockQty}
                              {isColorAlreadyAdded && ' (Đã thêm)'}
                            </Radio.Button>
                          );
                        })}
                    </Radio.Group>
                    {selectedProduct.colors.every((color: any) =>
                      existingColorsForSelectedProduct.includes(color.title) ||
                      getStockQuantity(color.title, selectedSize) <= 0
                    ) && (
                      <div style={{ color: 'red', marginTop: '8px' }}>
                        Tất cả các màu không có sẵn hoặc đã được thêm cho sản phẩm này.
                      </div>
                    )}
                  </>
                )}
              </Form.Item>
            )}

            {/* 👈 HIỂN THỊ SỐ LƯỢNG TỒN KHO HIỆN TẠI */}
            {(selectedColor || selectedSize) && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Số lượng tồn kho hiện tại: </Text>
                <Text type={currentStockQuantity > 0 ? 'success' : 'danger'}>
                  {currentStockQuantity}
                </Text>
              </div>
            )}

            {(selectedColor || selectedSize) && (
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                validateStatus={quantityError ? 'error' : ''}
                help={quantityError || ''}
              >
                <InputNumber
                  placeholder="Nhập số lượng"
                  min={1}
                  max={currentStockQuantity} // 👈 SET MAX THEO SỐ LƯỢNG TỒN KHO
                  style={{ width: '100%' }}
                  onChange={handleQuantityChange}
                  disabled={status === 'CANCELLED'}
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
                disabled={isQuantityExceeded || status === 'CANCELLED'}
              >
                {selectedDetail ? 'Cập nhật' : 'Thêm'}
              </Button>
              {selectedDetail && (
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    setSelectedDetail(null);
                    form.resetFields();
                    setSelectedProductId(undefined);
                    setSelectedProduct(null);
                    setSelectedColor(undefined);
                    setSelectedColorTitle('');
                    setSelectedSize('');
                    setCurrentStockQuantity(0); // 👈 RESET SỐ LƯỢNG TỒN KHO
                    setQuantityError('');
                    setIsQuantityExceeded(false);
                    setExistingColorsForSelectedProduct([]);
                  }}
                >
                  Huỷ
                </Button>
              )}
            </Form.Item>
          </Card>
        </Form>
      )}

      <Table
        loading={isLoading}
        columns={columns}
        dataSource={data}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => {
            if (status !== 'TRANSFERRED' && status !== 'COMPLETED') {
              setSelectedDetail(record);
              form.setFieldsValue({
                ...record,
                sku: record.product?.sku,
                color: selectedProduct?.colors?.find((c: any) => c.title === record.colorTitle)?.id,
                size: record.size,
              });
              setSelectedProduct(record.product);
              setSelectedProductId(record.productId);
              setSelectedColor(selectedProduct?.colors?.find((c: any) => c.title === record.colorTitle)?.id);
              setSelectedColorTitle(record.colorTitle);
              setSelectedSize(record.size || '');
              // 👈 CẬP NHẬT SỐ LƯỢNG TỒN KHO KHI EDIT
              const stockQty = getStockQuantity(record.colorTitle, record.size);
              setCurrentStockQuantity(stockQty);
            }
          },
        })}
        pagination={false}
      />
    </Modal>
  );
};

export default TransferDetailModal;