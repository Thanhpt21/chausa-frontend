import React, { useEffect, useState } from 'react';
import { Modal, Table, Spin, message, Form, InputNumber, Button, Select, Space, Tooltip, Card, Input, Radio, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useExportDetailsByExportId } from '@/hooks/export-detail/useExportDetailsByExportId';
import { formatVND } from '@/utils/helpers';
import { useCreateExportDetail } from '@/hooks/export-detail/useCreateExportDetail';
import { useDeleteExportDetail } from '@/hooks/export-detail/useDeleteExportDetail';
import { useUpdateExportDetail } from '@/hooks/export-detail/useUpdateExportDetail';
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { useColorQuantityByProductId } from '@/hooks/product/useColorQuantityByProductId';
import { useAllProjectCategories } from '@/hooks/project-category/useAllProjectCategories';

interface ExportProjectModalProps {
  visible: boolean;
  exportId: number;
  onClose: () => void;
  refetchExport: () => void;
  status: string;
}

const ExportProjectModal: React.FC<ExportProjectModalProps> = ({ visible, exportId, onClose, refetchExport, status }) => {
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
  const [isProductAdded, setIsProductAdded] = useState(false);
  const [quantityError, setQuantityError] = useState<string>('');
  const [isQuantityExceeded, setIsQuantityExceeded] = useState<boolean>(false);
  const [existingColorsForSelectedProduct, setExistingColorsForSelectedProduct] = useState<string[]>([]);
  const { data: projectCategories, isLoading: isProjectCategoriesLoading } = useAllProjectCategories({});
  const [selectedProjectCategoryId, setSelectedProjectCategoryId] = useState<number | null>(null);
  const [selectedProjectCategoryTitle, setSelectedProjectCategoryTitle] = useState<string>('');
  useEffect(() => {
    if (visible) {
      setSelectedExportDetail(null);
      form.resetFields();
      form.setFieldsValue({
        projectCategoryId: selectedProjectCategoryId,
        projectCategoryTitle: selectedProjectCategoryTitle,
      });
      setSelectedProductId(undefined);
      setIsAddingNew(true);
      setIsEditing(false);
      setIsProductAdded(false);
      setSelectedColor(undefined);
      setSelectedProduct(null);
      setSelectedColorTitle('');
      setQuantityError('');
      setIsQuantityExceeded(false);
      setExistingColorsForSelectedProduct([]);
      
      refetch().then(() => {
        // Có thể thêm logic nếu cần sau khi refetch hoàn tất
      });
    }
  }, [visible, form, refetch, selectedProjectCategoryId, selectedProjectCategoryTitle]);

  const { data: products, isLoading: isProductsLoading } = useAllProducts({});
  const { data: colorQuantities, isLoading: isColorLoading, error: colorError } = useColorQuantityByProductId(selectedProduct?.id);
  const quantity = Form.useWatch('quantity', form); // 👈 lắng nghe field số lượng

  useEffect(() => {
    if (!selectedProduct) return;
    if (!quantity) return;

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
    // Tìm sản phẩm từ danh sách products theo model (sku)
    const product = products?.find((p) => p.sku === value);
    
    if (product) {
      // Cập nhật sản phẩm được chọn
      setSelectedProduct(product);
      setSelectedProductId(product.id);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      
      // Cập nhật giá trị của form (đơn giá và tên sản phẩm)
      form.setFieldsValue({
        productId: product.id,
        unitPrice: product?.discount || product?.price || 0,
        discountSingle: product?.discountSingle ?? 0,     // ✅ set sẵn
        discountMultiple: product?.discountMultiple ?? 0, // ✅ set sẵn
        discountPercent: product?.discountSingle ?? 0,
      });
      
      // Reset các thông tin màu sắc và số lượng
      setQuantityError('');
      setIsQuantityExceeded(false);

      // Lọc các màu đã tồn tại cho sản phẩm này
      const existingColors = data
        ?.filter((detail: any) => detail.productId === product.id) // Lọc chi tiết có productId tương ứng
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

  const handleQuantityChange = (value: number | null) => {
    if (value === null) {
      setQuantityError('');
      setIsQuantityExceeded(false);
      return;
    }

    if (selectedColorTitle) {
      const selectedColorQuantity = colorQuantities?.data.find((item: any) => item.colorTitle === selectedColorTitle);
      const remainingQuantity = selectedColorQuantity ? selectedColorQuantity.remainingQuantity : 0;

      if (value > remainingQuantity) {
             setQuantityError('');
      setIsQuantityExceeded(false);
        form.setFields([
          {
            name: 'quantity',
            errors: [`Số lượng nhập vào (${value}) lớn hơn số lượng còn lại trong kho (${remainingQuantity})`],
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
        // ✅ Thêm logic discount
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
      title: 'Màu',
      dataIndex: 'colorTitle',
      key: 'colorTitle',
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

     if (!productId || isNaN(productId)) {  // Kiểm tra nếu productId không hợp lệ
        message.error('Vui lòng chọn sản phẩm');
        return;
      }

    if (!values.color) {
      message.error('Vui lòng chọn màu');
      return;
    }

    const finalColorData = selectedProduct?.colors?.find((c: any) => c.id === values.color);
    if (!finalColorData) {
      message.error('Màu đã chọn không hợp lệ.');
      return;
    }
    const finalColorTitle = finalColorData.title;


    const selectedColorQuantity = colorQuantities?.data.find((item: any) => item.colorTitle === finalColorTitle);

    const { sku, ...valueWithoutSku } = values;
    

    try {
      await mutateAsync({
        ...valueWithoutSku,
        exportId,
        productId,
        discountPercent: values.discountPercent,
        colorTitle: finalColorTitle,
        unit: selectedProduct?.unit || '',
        projectCategoryId: form.getFieldValue('projectCategoryId'),
        projectCategoryTitle: form.getFieldValue('projectCategoryTitle'),
      });
      message.success('Thêm chi tiết đơn báo giá thành công');
      form.resetFields();
      form.setFieldsValue({
        projectCategoryId: selectedProjectCategoryId,
        projectCategoryTitle: selectedProjectCategoryTitle,
      });
      setSelectedProductId(undefined);
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
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
        data: values,
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
      setQuantityError('');
      setIsQuantityExceeded(false);
      setExistingColorsForSelectedProduct([]);
    } catch {
      message.error('Cập nhật chi tiết đơn báo giá thất bại');
    }
  };

  const groupByCategory = (data: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    data.forEach(item => {
      const title = item.projectCategoryTitle || 'Khác';
      if (!grouped[title]) {
        grouped[title] = [];
      }
      grouped[title].push(item);
    });
    return grouped;
  };



  return (
    <Modal
      visible={visible}
      title="Chi tiết báo giá dự án"
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
            <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Danh mục dự án"
                    name="projectCategoryId"
                    rules={[{ required: true, message: 'Vui lòng chọn hạng mục dự án' }]}
                  >
                    <Select
                        placeholder="Chọn danh mục dự án"
                        loading={isProjectCategoriesLoading}
                        allowClear
                        value={selectedProjectCategoryId || undefined}  // bind với state
                        onChange={(value) => {
                          const selectedCategory = projectCategories?.data.find((c: any) => c.id === value);
                          setSelectedProjectCategoryId(value);
                          setSelectedProjectCategoryTitle(selectedCategory?.title || '');
                          form.setFieldsValue({
                            projectCategoryId: value,
                            projectCategoryTitle: selectedCategory?.title || null,
                          });
                        }}
                      >
                        {projectCategories?.data?.map((category: any) => (
                          <Select.Option key={category.id} value={category.id}>
                            {category.title}
                          </Select.Option>
                        ))}
                      </Select>
                  </Form.Item>
                </Col>

                {/* <Col span={12}>
                  <Form.Item label="Vị trí hiển thị (1-100)" name="projectCategoryOrder" rules={[{ required: false }]}>
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="Nhập vị trí"
                      disabled={status === 'CANCELLED'}
                    />
                  </Form.Item>
                </Col> */}
              </Row>
              <Form.Item name="projectCategoryTitle" style={{ display: 'none' }}>
                <Input />
              </Form.Item>
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
              <Form.Item label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}>
                <Input
                    placeholder="Nhập tên sản phẩm"
                    allowClear
                    value={selectedProduct?.title || ''}
                    disabled
                  />
              </Form.Item>

               <Form.Item label="Đơn vị tính">
                <Input  
                  placeholder="Đơn vị tính"
                  value={selectedProduct?.unit || ''}
                  disabled
                />
              </Form.Item>

              {!isProductAdded && selectedProduct && selectedProduct.colors?.length > 0 && (
                <Form.Item label="Chọn màu" name="color" rules={[{ required: true, message: 'Vui lòng chọn màu' }]}>
                  {isColorLoading ? (
                    <Spin size="small" />
                  ) : (
                    <>
                      <Radio.Group
                        value={selectedColor}
                        onChange={(e) => onColorChange(e.target.value)}
                      >
                        {selectedProduct.colors
                          // Loại bỏ .filter ở đây để hiển thị tất cả các màu
                          .map((color: any) => {
                            const colorQuantity = colorQuantities?.data.find((item: any) => item.colorTitle === color.title);
                            const remainingQuantity = colorQuantity ? colorQuantity.remainingQuantity : 0;
                            const isColorAlreadyAdded = existingColorsForSelectedProduct.includes(color.title); // Kiểm tra xem màu đã tồn tại chưa

                            return (
                              <Radio.Button
                                key={color.id}
                                value={color.id}
                              >
                                {color.title} - Số lượng trong kho: {remainingQuantity}
                                {isColorAlreadyAdded && ' (Đã thêm)'} {/* Thêm thông báo nếu đã thêm */}
                              </Radio.Button>
                            );
                          })}
                      </Radio.Group>
                      {/* Có thể thêm thông báo nếu tất cả các màu đều bị disable */}
                      {/* {selectedProduct.colors.every((color: any) => 
                        existingColorsForSelectedProduct.includes(color.title) || 
                        (colorQuantities?.data.find((item: any) => item.colorTitle === color.title)?.remainingQuantity || 0) <= 0
                      ) && (
                        <div style={{ color: 'red', marginTop: '8px' }}>
                          Tất cả các màu không có sẵn hoặc đã được thêm cho sản phẩm này.
                        </div>
                      )} */}
                    </>
                  )}
                </Form.Item>
              )}

              {selectedColor && (
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

              <Form.Item label="Ghi chú (kích thước, v.v)" name="note">
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
        Object.entries(groupByCategory(data || [])).map(([categoryTitle, items]) => (
          <div key={categoryTitle} style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12 }}>{categoryTitle}</h3>
            <Table
              columns={columns}
              dataSource={items}
              rowKey="id"
              pagination={false}
              bordered
              size="middle"
            />
          </div>
        ))
      )}
    </Modal>
  );
};

export default ExportProjectModal;