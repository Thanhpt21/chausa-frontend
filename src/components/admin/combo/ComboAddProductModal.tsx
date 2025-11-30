'use client';

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Table,
  Spin,
  message,
  Form,
  InputNumber,
  Button,
  Select,
  Space,
  Radio,
  Card,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { formatVND } from '@/utils/helpers';
import { Combo, ComboProduct } from '@/types/combo.type';
import { useProductCombo } from '@/hooks/combo-product/useProductCombo';
import { useCreateProductCombo } from '@/hooks/combo-product/useCreateProductCombo';
import { useDeleteProductCombo } from '@/hooks/combo-product/useDeleteProductCombo';

interface ComboAddProductModalProps {
  open: boolean;
  combo: Combo | null;
  onClose: () => void;
  refetch: () => void;
}

export const ComboAddProductModal: React.FC<ComboAddProductModalProps> = ({
  open,
  combo,
  onClose,
  refetch,
}) => {
  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<number | undefined>(undefined);
  const [selectedColorTitle, setSelectedColorTitle] = useState<string>('');

  // Lấy tất cả sản phẩm
  const { data: products, isLoading: isProductsLoading } = useAllProducts({});
  

const comboId = Number(combo?.id);
const { data: comboProductsResponse, isLoading: isComboProductsLoading, refetch: refetchComboProducts } = useProductCombo(comboId);
  const comboProducts = comboProductsResponse?.data || [];

  const { mutateAsync: createComboProduct } = useCreateProductCombo();

  // Xóa sản phẩm khỏi combo
  const { mutateAsync: deleteComboProduct } = useDeleteProductCombo();

  useEffect(() => {
    form.resetFields();
    setSelectedProduct(null);
    setSelectedColor(undefined);
    setSelectedColorTitle('');
  }, [combo, open, form]);

  const handleProductChange = (value: any) => {
    const product = products?.find((p) => p.id === value);
    if (product) {
      setSelectedProduct(product);
      form.setFieldsValue({
        unitPrice: product.price || 0,
        quantity: 1,
      });
    }
  };

  const handleColorChange = (value: any) => {
    const colorData = selectedProduct?.colors?.find((c: any) => c.id === value);
    if (colorData) {
      setSelectedColor(value);
      setSelectedColorTitle(colorData.title || '');
    } else {
      setSelectedColor(undefined);
      setSelectedColorTitle('');
    }
  };

  const getDisabledColors = (): number[] => {
    return comboProducts?.reduce((arr: number[], cp: ComboProduct) => {
      if (cp.productId === selectedProduct?.id) arr.push(cp.color);
      return arr;
    }, []) || [];
  };

  const onFinish = async (values: any) => {
    if (!selectedProduct) {
      message.error('Vui lòng chọn sản phẩm');
      return;
    }
    if (!selectedColorTitle) {
      message.error('Vui lòng chọn màu');
      return;
    }

    const isExist = comboProducts?.some(
      (cp: any) => cp.productId === selectedProduct.id && cp.colorTitle === selectedColorTitle
    );
    if (isExist) {
      message.error(
        `Sản phẩm '${selectedProduct.title}' với màu '${selectedColorTitle}' đã tồn tại trong combo.`
      );
      return;
    }

    try {
      await createComboProduct({
        comboId: combo?.id || 0,
        productId: selectedProduct.id,
        quantity: values.quantity || 1,
        unitPrice: values.unitPrice || 0,
        color: selectedColor || 0,
        colorTitle: selectedColorTitle,
        unit: selectedProduct.unit || '',
        finalPrice: 0,
        note: '',
      });
      message.success('Thêm sản phẩm vào combo thành công');
      form.resetFields();
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
      refetchComboProducts();
      refetch();
    } catch (error: any) {
      message.error(error?.message || 'Thêm sản phẩm thất bại');
    }
  };

  const handleDelete = async (record: ComboProduct) => {
    Modal.confirm({
      title: 'Xác nhận xóa sản phẩm',
      content: `Bạn có chắc chắn muốn xóa sản phẩm '${record.product.title}' khỏi combo?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteComboProduct({
            comboId: combo?.id || 0,
            productId: record.productId,
          });
          message.success('Xóa thành công');
          refetchComboProducts();
          refetch();
        } catch (error: any) {
          message.error(error?.message || 'Xóa thất bại');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tên sản phẩm',
      render: (_text: any, record: ComboProduct) => record.product?.title || '-',
    },
    { title: 'Màu', dataIndex: 'colorTitle', key: 'colorTitle' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (v: number) => formatVND(v),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_text: any, record: ComboProduct) => (
        <Space>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={`Thêm sản phẩm vào combo: ${combo?.title}`}
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Card title="Thêm sản phẩm mới" style={{ marginBottom: 20 }}>
          <Form.Item label="Chọn sản phẩm" name="productId" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Chọn sản phẩm"
              loading={isProductsLoading}
              optionFilterProp="children"
              onChange={handleProductChange}
              value={selectedProduct?.id}
            >
              {products?.map((p: any) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.title} ({p.sku})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedProduct && selectedProduct.colors?.length > 0 && (
            <Form.Item label="Chọn màu" name="color" rules={[{ required: true }]}>
              <Radio.Group onChange={(e) => handleColorChange(e.target.value)} value={selectedColor}>
                {selectedProduct.colors.map((c: any) => (
                  <Radio.Button key={c.id} value={c.id} disabled={getDisabledColors().includes(c.id)}>
                    {c.title}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          )}

          <Form.Item label="Số lượng" name="quantity" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Đơn giá" name="unitPrice" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Thêm sản phẩm
            </Button>
          </Form.Item>
        </Card>
      </Form>

      <Table
        dataSource={comboProducts}
        columns={columns}
        rowKey="id"
        pagination={false}
        />
    </Modal>
  );
};
