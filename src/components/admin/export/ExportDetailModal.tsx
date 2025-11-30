import React, { useEffect, useState } from 'react';
import { Modal, Table, Spin, message, Form, InputNumber, Button, Select, Space, Tooltip, Card, Input, Radio, FormInstance  } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useExportDetailsByExportId } from '@/hooks/export-detail/useExportDetailsByExportId';
import { formatVND } from '@/utils/helpers';
import { useCreateExportDetail } from '@/hooks/export-detail/useCreateExportDetail';
import { useDeleteExportDetail } from '@/hooks/export-detail/useDeleteExportDetail';
import { useUpdateExportDetail } from '@/hooks/export-detail/useUpdateExportDetail';
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { useColorQuantityByProductId } from '@/hooks/product/useColorQuantityByProductId';
import { PRODUCT_SIZES } from '@/enums/size.enum'; 

interface ExportDetailModalProps {
  visible: boolean;
  exportId: number;
  onClose: () => void;
  refetchExport: () => void;
  status: string;
}

const ExportDetailModal: React.FC<ExportDetailModalProps> = ({ visible, exportId, onClose, refetchExport, status }) => {
  const { data, isLoading, error, refetch } = useExportDetailsByExportId(exportId);
  const { mutateAsync, isPending } = useCreateExportDetail();
  const { mutateAsync: deleteExportDetail } = useDeleteExportDetail();
  const { mutateAsync: updateExportDetail } = useUpdateExportDetail();
  const [form] = Form.useForm();
  const [selectedExportDetail, setSelectedExportDetail] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<number | undefined>(undefined);
  const [selectedColorTitle, setSelectedColorTitle] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>(''); // 👈 THÊM STATE CHO SIZE
  const [isProductAdded, setIsProductAdded] = useState(false);
  const [quantityError, setQuantityError] = useState<string>('');
  const [isQuantityExceeded, setIsQuantityExceeded] = useState<boolean>(false);
  const [existingColorsForSelectedProduct, setExistingColorsForSelectedProduct] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setSelectedExportDetail(null);
      form.resetFields();
      setSelectedProductId(undefined);
      setIsAddingNew(true);
      setIsEditing(false);
      setIsProductAdded(false);
      setSelectedColor(undefined);
      setSelectedProduct(null);
      setSelectedColorTitle('');
      setSelectedSize(''); // 👈 RESET SIZE
      setQuantityError('');
      setIsQuantityExceeded(false);
      setExistingColorsForSelectedProduct([]);
      
      refetch().then(() => {
        // Có thể thêm logic nếu cần sau khi refetch hoàn tất
      });
    }
  }, [visible, form, refetch]);

  const { data: products, isLoading: isProductsLoading } = useAllProducts({});
  const { data: colorQuantities, isLoading: isColorLoading, error: colorError } = useColorQuantityByProductId(selectedProduct?.id);

  const quantity = Form.useWatch('quantity', form);

  useEffect(() => {
    if (!selectedProduct) return;
    if (quantity === 1) {
      form.setFieldsValue({
        discountPercent: selectedProduct?.discountSingle ?? 0,
      });
    } else if (quantity >= 2) {
      form.setFieldsValue({
        discountPercent: selectedProduct?.discountMultiple ?? 0,
      });
    }
  }, [quantity, selectedProduct, form]);

  const onProductChange = (value: string) => {
    const product = products?.find((p) => p.sku === value);
    
    if (product) {
      setSelectedProduct(product);
      setSelectedProductId(product.id);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize(''); // 👈 RESET SIZE KHI ĐỔI SẢN PHẨM
      
      form.setFieldsValue({
        productId: product.id,
        unitPrice: product?.discount || product?.price || 0,
        discountSingle: product?.discountSingle ?? 0,
        discountMultiple: product?.discountMultiple ?? 0,
        discountPercent: product?.discountSingle ?? 0,
        size: undefined, // 👈 RESET SIZE TRONG FORM
      });
      
      setQuantityError('');
      setIsQuantityExceeded(false);

      const existingColors = data
        ?.filter((detail: any) => detail.productId === product.id)
        .map((detail: any) => detail.colorTitle)
        .filter((color: string) => color); 
      setExistingColorsForSelectedProduct(existingColors || []);
    }
  };

  const onColorChange = (value: any) => {
    const selectedColorData = selectedProduct?.colors?.find((c: any) => c.id === value);
    if (selectedColorData) {
      setSelectedColor(value);
      setSelectedColorTitle(selectedColorData.title || '');
      setQuantityError('');
      setIsQuantityExceeded(false);
      form.setFieldsValue({ color: value }); 
    }
  };

  // 👈 HANDLE SIZE CHANGE
  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
    setQuantityError('');
    setIsQuantityExceeded(false);
  };

  const handleQuantityChange = (value: number | null) => {
    if (value === null) {
      setQuantityError('');
      setIsQuantityExceeded(false);
      return;
    }

    if (selectedColorTitle || selectedSize) {
      // 👈 KIỂM TRA TỒN KHO CHO CẢ MÀU VÀ SIZE
      let remainingQuantity = 0;
      
      if (selectedColorTitle) {
        const selectedColorQuantity = colorQuantities?.data.find((item: any) => item.colorTitle === selectedColorTitle);
        remainingQuantity = selectedColorQuantity ? selectedColorQuantity.remainingQuantity : 0;
      }
      // Có thể thêm logic kiểm tra tồn kho theo size nếu cần

      if (value > remainingQuantity) {
        setQuantityError(``);
        setIsQuantityExceeded(false);
        form.setFields([
          {
            name: 'quantity',
            errors: [],
          },
        ]);
      } else {
        setQuantityError('');
        setIsQuantityExceeded(false);
        form.setFields([
          {
            name: 'quantity',
            errors: [],
          },
        ]);
      }
    }
    
    if (value === 1) {
      form.setFieldsValue({ discountPercent: selectedProduct?.discountSingle ?? 0 });
    } else if (value >= 2) {
      form.setFieldsValue({ discountPercent: selectedProduct?.discountMultiple ?? 0 });
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
      title: 'Size', // 👈 THÊM CỘT SIZE
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
      title: '% giảm',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
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
    ...(status !== 'EXPORTED' && status !== 'COMPLETED' && status !== 'PREPARED' ? [{
      title: 'Hành động',
      key: 'action',
      render: (_text: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Xoá">
            <DeleteOutlined
              style={{
                color: 'red',
                cursor: (status === 'CANCELLED' || status === 'EXPORTED' || status === 'COMPLETED' || status === 'PREPARED') ? 'not-allowed' : 'pointer',
              }}
              onClick={() => {
                if (status !== 'CANCELLED' && status !== 'EXPORTED' && status !== 'COMPLETED' && status !== 'PREPARED') {
                  Modal.confirm({
                    title: 'Xác nhận xoá sản phẩm',
                    content: `Bạn có chắc chắn muốn xoá sản phẩm khỏi đơn báo giá này không?`,
                    okText: 'Xoá',
                    okType: 'danger',
                    cancelText: 'Hủy',
                    onOk: async () => {
                      try {
                        await deleteExportDetail(record.id);
                        message.success('Xoá chi tiết sản phẩm thành công');
                        refetch();
                      } catch {
                        message.error('Xoá thất bại');
                      }
                    },
                  });
                }
              }}
              disabled={status === 'CANCELLED' || status === 'EXPORTED' || status === 'COMPLETED' || status === 'PREPARED'}
            />
          </Tooltip>
        </Space>
      ),
    }] : []),
  ];

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

    // 👈 KIỂM TRA ÍT NHẤT MÀU HOẶC SIZE PHẢI ĐƯỢC CHỌN
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

    // 👈 KIỂM TRA TRÙNG LẶP THEO CẢ MÀU VÀ SIZE
    const isCombinationExist = data?.some((detail: any) =>
      detail.productId === productId &&
      detail.colorTitle === finalColorTitle &&
      detail.size === selectedSize &&
      (!selectedExportDetail || selectedExportDetail.id !== detail.id)
    );

    if (isCombinationExist) {
      message.error(`Sản phẩm '${selectedProduct?.title}' với màu '${finalColorTitle}' và size '${selectedSize}' đã tồn tại trong đơn báo giá này.`);
      return;
    }

    // KIỂM TRA TỒN KHO
    if (finalColorTitle) {
      const selectedColorQuantity = colorQuantities?.data.find((item: any) => item.colorTitle === finalColorTitle);
      const remainingQuantity = selectedColorQuantity ? selectedColorQuantity.remainingQuantity : 0;

      if (values.quantity > remainingQuantity) {
        message.warning(`Số lượng nhập vào (${values.quantity}) lớn hơn số lượng còn lại trong kho (${remainingQuantity})`);
      }
    }

    const { sku, ...valueWithoutSku } = values;

    try {
      await mutateAsync({
        ...valueWithoutSku,
        exportId,
        productId,
        discountPercent: values.discountPercent,
        colorTitle: finalColorTitle,
        size: selectedSize, // 👈 THÊM SIZE VÀO DATA
        unit: selectedProduct?.unit || '',
      });
      message.success('Thêm chi tiết đơn báo giá thành công');
      form.resetFields();
      setSelectedProductId(undefined);
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize(''); // 👈 RESET SIZE
      setIsProductAdded(false);
      setQuantityError('');
      setIsQuantityExceeded(false);
      setExistingColorsForSelectedProduct([]);
      refetch();
      refetchExport();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi khi thêm chi tiết đơn báo giá');
    }
  };

  const onEditFinish = async (values: any) => {
    if (!selectedExportDetail) {
      message.error('Chi tiết cần cập nhật không hợp lệ');
      return;
    }

    try {
      await updateExportDetail({
        id: selectedExportDetail.id,
        data: {
          ...values,
          size: selectedSize, // 👈 THÊM SIZE VÀO UPDATE
        },
      });
      message.success('Cập nhật chi tiết đơn báo giá thành công');
      refetch();
      refetchExport();
      setSelectedExportDetail(null);
      form.resetFields();
      setIsAddingNew(true);
      setSelectedProductId(undefined);
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize(''); // 👈 RESET SIZE
      setQuantityError('');
      setIsQuantityExceeded(false);
      setExistingColorsForSelectedProduct([]);
    } catch {
      message.error('Cập nhật chi tiết đơn báo giá thất bại');
    }
  };

  return (
    <Modal
      visible={visible}
      title="Chi tiết đơn báo giá"
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      <div style={{ marginBottom: '20px' }}>
        {status !== 'EXPORTED' && status !== 'COMPLETED' && status !== 'PREPARED' && (
          <Form
            form={form}
            layout="vertical"
            onFinish={selectedExportDetail ? onEditFinish : onFinish}
          >
            <Card title="Chi Tiết sản phẩm" bordered={true} style={{ marginBottom: 20 }}>
              <Form.Item label="Model" name="sku" rules={[{ required: true, message: 'Vui lòng chọn Model' }]}>
                {selectedExportDetail ? (
                  <div>{selectedExportDetail.product?.sku}</div>
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
             
              <Form.Item label="Chọn Tên sản phẩm">
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
                      console.log('Chọn Tên sản phẩm:', product);
                      setSelectedProduct(product);
                      form.setFieldsValue({
                        sku: product.sku,
                        productId: product.id,
                      });
                    }
                  }}
                  value={selectedProduct?.title || ''}
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

              {/* 👈 FORM SELECT CHO SIZE */}
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

              {!isProductAdded && selectedProduct && selectedProduct.colors?.length > 0 && (
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
                            const colorQuantity = colorQuantities?.data.find((item: any) => item.colorTitle === color.title);
                            const remainingQuantity = colorQuantity ? colorQuantity.remainingQuantity : 0;
                            const isColorAlreadyAdded = existingColorsForSelectedProduct.includes(color.title);

                            return (
                              <Radio.Button
                                key={color.id}
                                value={color.id}
                                // disabled={remainingQuantity <= 0 || isColorAlreadyAdded}
                              >
                                {color.title} - Số lượng trong kho: {remainingQuantity}
                                {isColorAlreadyAdded && ' (Đã thêm)'}
                              </Radio.Button>
                            );
                          })}
                      </Radio.Group>
                    </>
                  )}
                </Form.Item>
              )}

              {(selectedColor || selectedSize) && ( // 👈 HIỂN THỊ KHI CÓ MÀU HOẶC SIZE
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
                    style={{ width: '100%' }}
                    disabled={status === 'CANCELLED'}
                    onChange={handleQuantityChange}
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
                  disabled={status === 'CANCELLED'}
                />
              </Form.Item>

              <Form.Item
                label="% Giảm giá"
                name="discountPercent"
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="Nhập % giảm giá (nếu có)"
                />
              </Form.Item>

              <Form.Item label="Ghi chú" name="note">
                <Input placeholder="Nhập ghi chú" disabled={status === 'CANCELLED'} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isPending}
                  block
                  disabled={status === 'CANCELLED' || isQuantityExceeded}
                >
                  {selectedExportDetail ? 'Cập nhật chi tiết' : 'Thêm chi tiết'}
                </Button>
              </Form.Item>
            </Card>
          </Form>
        )}
      </div>

      {isLoading ? (
        <Spin size="large" />
      ) : (
        <Table
          columns={columns}
          dataSource={data || []}
          rowKey="id"
          pagination={false}
        />
      )}
    </Modal>
  );
};

export default ExportDetailModal;