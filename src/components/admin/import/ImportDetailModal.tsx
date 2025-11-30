import React, { useEffect, useState } from 'react';
import { Modal, Table, Spin, message, Form, InputNumber, Button, Select, Space, Tooltip, Card, Radio, Input } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useImportDetailsByImportId } from '@/hooks/import-detail/useImportDetailsByImportId';
import { formatVND } from '@/utils/helpers';
import { useCreateImportDetail } from '@/hooks/import-detail/useCreateImportDetail';
import { useDeleteImportDetail } from '@/hooks/import-detail/useDeleteImportDetail';
import { useUpdateImportDetail } from '@/hooks/import-detail/useUpdateImportDetail';
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { PRODUCT_SIZES } from '@/enums/size.enum';

interface ImportDetailModalProps {
  visible: boolean;
  importId: number;
  onClose: () => void;
  refetchImport: () => void;
  status: string;
}

const ImportDetailModal: React.FC<ImportDetailModalProps> = ({ visible, importId, onClose, refetchImport, status }) => {
  const { data, isLoading, error, refetch } = useImportDetailsByImportId(importId);
  const { mutateAsync, isPending } = useCreateImportDetail();
  const { mutateAsync: deleteImportDetail } = useDeleteImportDetail();
  const { mutateAsync: updateImportDetail } = useUpdateImportDetail();
  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<number | undefined>(undefined);
  const [selectedColorTitle, setSelectedColorTitle] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>(''); // 👈 THÊM STATE CHO SIZE
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedImport, setSelectedImport] = useState<any>(null);
  
  const { data: products, isLoading: isProductsLoading } = useAllProducts({});

  useEffect(() => {
    if (error) {
      message.error('Đã có lỗi khi tải dữ liệu chi tiết sản phẩm nhập kho');
    }
  }, [error]);

  useEffect(() => {
    if (selectedImport) {
      form.setFieldsValue({
        productId: selectedImport.product?.id,
        quantity: selectedImport.quantity,
        unitPrice: selectedImport.unitPrice,
        color: selectedImport.colorId,
        size: selectedImport.size, // 👈 SET SIZE KHI EDIT
      });
      setSelectedProduct(selectedImport.product);
      setSelectedColor(selectedImport.colorId);
      setSelectedColorTitle(selectedImport.colorTitle);
      setSelectedSize(selectedImport.size || ''); // 👈 SET SIZE
    } else {
      form.resetFields();
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize(''); // 👈 RESET SIZE
    }
  }, [selectedImport, form, visible]);

  const columns = [
    {
      title: 'Tên sản phẩm',
      key: 'productTitle',
      render: (text: any, record: any) => record.product?.title || '-',
    },
    {
      title: 'Model',
      dataIndex: 'sku',
      render: (text: any, record: any) => record.product?.sku || '-',
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
      title: 'Đơn giá / 1 SP',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (unitPrice: any) => formatVND(unitPrice),
    },
    ...(status !== 'COMPLETED' ? [{
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_text: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{
                color: '#1890ff',
                cursor: status === 'CANCELLED' ? 'not-allowed' : 'pointer',
              }}
              onClick={() => {
                if (status !== 'CANCELLED') {
                  setIsEditing(true);
                  setSelectedImport(record);
                }
              }}
              disabled={status === 'CANCELLED'}
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <DeleteOutlined
              style={{
                color: 'red',
                cursor: status === 'CANCELLED' ? 'not-allowed' : 'pointer',
              }}
              onClick={() => {
                if (status !== 'CANCELLED') {
                  Modal.confirm({
                    title: 'Xác nhận xoá sản phẩm nhập kho',
                    content: `Bạn có chắc chắn muốn xoá sản phẩm nhập kho này không?`,
                    okText: 'Xoá',
                    okType: 'danger',
                    cancelText: 'Hủy',
                    onOk: async () => {
                      try {
                        await deleteImportDetail(record.id);
                        message.success('Xoá chi tiết sản phẩm nhập kho thành công');
                        refetch();
                        refetchImport();
                      } catch (error) {
                        message.error('Xoá thất bại');
                      }
                    },
                  });
                }
              }}
              disabled={status === 'CANCELLED'}
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

    // 👈 KIỂM TRA SIZE VÀ MÀU (ít nhất một trong hai phải được chọn)
    if (!selectedColorTitle && !selectedSize) {
      message.error('Vui lòng chọn màu hoặc size');
      return;
    }

    const isProductCombinationExist = data?.some(
      (detail: any) =>
        detail.productId === values.productId &&
        detail.colorTitle === selectedColorTitle &&
        detail.size === selectedSize && // 👈 THÊM KIỂM TRA SIZE
        (!selectedImport || selectedImport.id !== detail.id)
    );

    if (isProductCombinationExist) {
      message.error(`Sản phẩm '${selectedProduct?.title}' với màu '${selectedColorTitle}' và size '${selectedSize}' đã tồn tại trong sản phẩm nhập kho này.`);
      return;
    }

    const { sku, ...valueWithoutSku } = values;

    try {
      await mutateAsync({
        ...valueWithoutSku,
        importId,
        productId,
        colorTitle: selectedColorTitle,
        size: selectedSize, // 👈 THÊM SIZE VÀO DATA
        unit: selectedProduct?.unit || ''
      });
      message.success('Thêm chi tiết sản phẩm nhập kho thành công');
      form.resetFields();
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize(''); // 👈 RESET SIZE
      refetch();
      refetchImport();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi khi thêm chi tiết sản phẩm nhập kho');
    }
  };

  const onEditFinish = async (values: any) => {
    if (!selectedImport) {
      message.error('Chi tiết sản phẩm cần cập nhật không hợp lệ');
      return;
    }

    // 👈 KIỂM TRA SIZE VÀ MÀU (ít nhất một trong hai phải được chọn)
    if (!selectedColorTitle && !selectedSize) {
      message.error('Vui lòng chọn màu hoặc size');
      return;
    }

    const isProductCombinationExist = data?.some(
      (detail: any) =>
        detail.productId === values.productId &&
        detail.colorTitle === selectedColorTitle &&
        detail.size === selectedSize && // 👈 THÊM KIỂM TRA SIZE
        detail.id !== selectedImport.id
    );

    if (isProductCombinationExist) {
      message.error(`Sản phẩm '${selectedProduct?.title}' với màu '${selectedColorTitle}' và size '${selectedSize}' đã tồn tại trong sản phẩm nhập kho này.`);
      return;
    }

    try {
      await updateImportDetail({
        id: selectedImport.id,
        data: {
          ...values,
          colorTitle: selectedColorTitle,
          size: selectedSize, // 👈 THÊM SIZE VÀO DATA UPDATE
        },
      });
      message.success('Cập nhật chi tiết sản phẩm nhập kho thành công');
      refetch();
      refetchImport();
      setSelectedImport(null);
      setIsEditing(false);
      form.resetFields();
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      setSelectedSize(''); // 👈 RESET SIZE
    } catch (error) {
      message.error('Cập nhật chi tiết sản phẩm nhập kho thất bại');
    }
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setSelectedImport(null);
    form.resetFields();
    setSelectedProduct(null);
    setSelectedColor(undefined);
    setSelectedColorTitle('');
    setSelectedSize(''); // 👈 RESET SIZE
    setIsEditing(false);
  };

  const handleProductChange = (value: any) => {
    const product = products?.find((p) => p.sku === value);
    if (product) {
      setSelectedProduct(product);
      form.setFieldsValue({
        unitPrice: product.price,
        productId: product.id,
      });
    } else {
      setSelectedProduct(null);
      form.resetFields(['unitPrice', 'productId']);
    }
  };

  const handleColorChange = (value: any) => {
    const selectedColorData = selectedProduct?.colors?.find((c: any) => c.id === value);
    if (selectedColorData) {
      setSelectedColor(value);
      setSelectedColorTitle(selectedColorData.title || '');
    } else {
      setSelectedColor(undefined);
      setSelectedColorTitle('');
    }
  };

  // 👈 HANDLE SIZE CHANGE
  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
  };

  const getDisabledColors = (): number[] => {
    return data?.reduce((disabledColors: number[], detail: any) => {
      if (detail.productId === selectedProduct?.id && detail.size === selectedSize) {
        disabledColors.push(detail.color); 
      }
      return disabledColors;
    }, []) || [];
  };

  const handleProductTitleChange = (productId: number) => {
    const product = products?.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      form.setFieldsValue({
        sku: product.sku,
        unitPrice: product.price,
        productId: product.id,
      });
    } else {
      setSelectedProduct(null);
      form.resetFields(['sku', 'unitPrice', 'productId']);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Chi tiết sản phẩm nhập kho"
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div style={{ marginBottom: '20px' }}>
        {status !== 'COMPLETED' && (
          <Button
            type="default"
            onClick={handleAddNew}
            style={{ marginBottom: '20px' }}
            disabled={status === 'CANCELLED'}
          >
            Thêm mới
          </Button>
        )}
        
        {status !== 'COMPLETED' && (
          <Form
            form={form}
            layout="vertical"
            onFinish={isEditing ? onEditFinish : onFinish}
            initialValues={isEditing ? {
              productId: selectedImport?.product?.id,
              quantity: selectedImport?.quantity,
              unitPrice: selectedImport?.unitPrice,
              color: selectedImport?.colorId,
              size: selectedImport?.size, // 👈 INITIAL SIZE
            } : {}}
          >
            <Card title={isEditing ? `Cập nhật: ${selectedProduct?.title} - ${selectedProduct?.sku} - (${selectedImport?.colorTitle})` : "Thêm mới sản phẩm"} bordered={true} style={{ marginBottom: 20 }}>
              {!isEditing && (
                <Form.Item label="Model" name="sku" rules={[{ required: true, message: 'Vui lòng chọn Model' }]}>
                  {selectedImport ? (
                    <div>{selectedImport.product?.sku}</div>
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
                      onChange={handleProductChange}
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
              )}
              
              {!isEditing && (
                <Form.Item label="Tên sản phẩm" name="productId" rules={[{ required: true, message: 'Vui lòng chọn tên sản phẩm' }]}>
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
                    onChange={handleProductTitleChange}
                    value={selectedProduct?.id || undefined}
                  >
                    {products?.map((product: any) => (
                      <Select.Option key={product.id} value={product.id}>
                        {product.title}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              {!isEditing && (
                <Form.Item label="Đơn vị tính">
                  <Input  
                    placeholder="Đơn vị tính"
                    value={selectedProduct?.unit || ''}
                    disabled
                  />
                </Form.Item>
              )}

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

              {selectedProduct && selectedProduct.colors?.length > 0 && !isEditing && (
                <Form.Item label="Chọn màu" name="color">
                  <Radio.Group
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    disabled={status === 'CANCELLED' || isEditing}
                  >
                    {selectedProduct.colors.map((color: any) => (
                      <Radio.Button
                        key={color.id}
                        value={color.id}
                        disabled={getDisabledColors().includes(color.id)}
                      >
                        {color.title}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </Form.Item>
              )}

              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
                <InputNumber
                  placeholder="Nhập số lượng"
                  min={1}
                  style={{ width: '100%' }}
                  disabled={status === 'CANCELLED'}
                />
              </Form.Item>

              <Form.Item
                label="Đơn giá"
                name="unitPrice"
                rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}>
                <InputNumber
                  placeholder="Nhập đơn giá"
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                  disabled={status === 'CANCELLED'}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isPending}
                  block
                  disabled={status === 'CANCELLED'}
                >
                  {isEditing ? 'Cập nhật chi tiết' : 'Thêm chi tiết'}
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

export default ImportDetailModal;