import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Table, Spin, message, Form, InputNumber, Button, Select, Space, Tooltip, Card, Radio, Input } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { usePurchaseDetailsByPurchaseId } from '@/hooks/purchase-detail/usePurchaseDetailsByPurchaseId';
import { formatVND } from '@/utils/helpers';
import { useCreatePurchaseRequestDetail } from '@/hooks/purchase-detail/useCreatePurchaseRequestDetail';
import { useDeletePurchaseRequestDetail } from '@/hooks/purchase-detail/useDeletePurchaseRequestDetail';
import { useUpdatePurchaseRequestDetail } from '@/hooks/purchase-detail/useUpdatePurchaseRequestDetail';
import { useLowStockProducts } from '@/hooks/product/useLowStockProducts';

interface PurchaseDetailModalProps {
  visible: boolean;
  purchaseId: number;
  onClose: () => void;
  refetchPurchase: () => void;
  status: string;
}

const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({ visible, purchaseId, onClose, refetchPurchase, status }) => {
  const { data, isLoading, error, refetch } = usePurchaseDetailsByPurchaseId(purchaseId);
  const { mutateAsync, isPending } = useCreatePurchaseRequestDetail();
  const { mutateAsync: deletePurchaseDetail } = useDeletePurchaseRequestDetail();
  const { mutateAsync: updatePurchaseDetail } = useUpdatePurchaseRequestDetail();
  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<number | undefined>(undefined);
  const [selectedColorTitle, setSelectedColorTitle] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [threshold, setThreshold] = useState<number>(10);
  const [tempThreshold, setTempThreshold] = useState<number>(10);
  const [editableQuantities, setEditableQuantities] = useState<Record<string, number>>({});
  const [editablePrices, setEditablePrices] = useState<Record<string, number>>({});

  const { data: lowStockResponse, isLoading: isLowStockLoading, error: lowStockError } = useLowStockProducts({ threshold  });
    const products = lowStockResponse?.data || [];
    const isProductsLoading = isLowStockLoading;

  const flattenedProductRows = useMemo(() => {
  if (!products || products.length === 0) return [];

  return products.flatMap((product: any) => {
        return product.stockByColor.map((colorInfo: any) => ({
            id: `${product.id}-${colorInfo.color}`,
            productId: product.id,
            sku: product.sku,
            title: product.title,
            price: product.price,
            color: colorInfo.color,                 
            colorTitle: colorInfo.colorTitle,
            remainingQuantity: colorInfo.remainingQuantity,
        }));
    });
    }, [products]);


  useEffect(() => {
    if (error) {
      message.error('Đã có lỗi khi tải dữ liệu chi tiết sản phẩm mua hàng');
    }
  }, [error]);

  useEffect(() => {
    if (selectedPurchase) {
      form.setFieldsValue({
        productId: selectedPurchase.product?.id,
        quantity: selectedPurchase.quantity,
        unitPrice: selectedPurchase.unitPrice,
        color: selectedPurchase.colorId,
      });
      setSelectedProduct(selectedPurchase.product);
      setSelectedColor(selectedPurchase.colorId);
      setSelectedColorTitle(selectedPurchase.colorTitle);
    } else {
      form.resetFields();
      setSelectedProduct(null);
      setSelectedColor(undefined);
      setSelectedColorTitle('');
    }
  }, [selectedPurchase, form, visible]);

  

    const columnsFromAPI = [
    {
        title: 'Tên sản phẩm',
        key: 'title',
        render: (_: any, record: any) => record.product?.title || '',
    },
    {
        title: 'Model',
        key: 'sku',
        render: (_: any, record: any) => record.product?.sku || '',
    },
    {
        title: 'Màu',
        dataIndex: 'colorTitle',
    },
    {
        title: 'Số lượng tồn kho mới đã thêm',
        key: 'quantity',
        render: (_: any, record: any) => (
        <InputNumber
            min={1}
            style={{ width: 80 }}
            value={editableQuantities[record.id] ?? record.quantity}
            onChange={(val) => updateQuantity(record.id, val || 1)}
            disabled={status === 'COMPLETED'}
        />
        ),
    },
    {
        title: 'Đơn giá',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        render: (unitPrice: any) => formatVND(unitPrice),
    },
    ];



    const columnsFromFlattenedProducts = [
    {
        title: 'Tên sản phẩm',
        dataIndex: 'title',
    },
    {
        title: 'Model',
        dataIndex: 'sku',
    },
    {
        title: 'Màu',
        dataIndex: 'colorTitle',
    },
    {
        title: 'SL tồn kho hiện tại',
        dataIndex: 'remainingQuantity',
        render: (value: number) => (
        <span style={{ color: value <= threshold ? 'red' : 'black' }}>{value}</span>
        ),
    },
    {
        title: 'Đơn giá',
        dataIndex: 'price',
        key: 'price',
        render: (price: any) => formatVND(price),
    },
    {
        title: 'Nhập SL mới',
        key: 'quantityInput',
        render: (_: any, record: any) => (
        <InputNumber
            min={1}
            style={{ width: 80 }}
            value={editableQuantities[record.id] ?? 1}
            onChange={(val) => updateQuantity(record.id, val || 1)}
        />
        ),
    },
    ];


  const handleAddQuantityToStock = async () => {
    if (!purchaseId) {
        message.error('Purchase ID không hợp lệ');
        return;
    }

    // Lấy danh sách các mục mà user đã nhập SL mới (editableQuantities)
    // Mỗi key của editableQuantities là dạng `${productId}-${color}`, nên cần parse lại productId từ key
    const entries = Object.entries(editableQuantities);
    if (entries.length === 0) {
        message.warning('Vui lòng nhập số lượng mới cho ít nhất một sản phẩm');
        return;
    }

    try {
        for (const [key, quantity] of entries) {
        if (quantity <= 0) continue;

        // Tìm sản phẩm tương ứng trong flattenedProductRows theo id key
        const productRow = flattenedProductRows.find(p => p.id === key);
        if (!productRow) continue;

        // Gọi API tạo mới purchase request detail
        await mutateAsync({
            purchaseRequestId: purchaseId,
            productId: productRow.productId,
            quantity,
            unitPrice: productRow.price, 
            color: productRow.color,
            colorTitle: productRow.colorTitle,
        });
        }
        message.success('Thêm số lượng mới vào kho thành công');
        setEditableQuantities({}); // reset inputs
        refetch();
        refetchPurchase();
    } catch (error) {
        message.error('Thêm số lượng mới vào kho thất bại');
    }
    };

    const handleUpdateQuantities = async () => {
    if (!data || data.length === 0) {
        message.warning('Không có dữ liệu để cập nhật');
        return;
    }

    try {
        for (const detail of data) {
        const updatedQuantity = editableQuantities[detail.id];

        if (updatedQuantity != null && updatedQuantity !== detail.quantity) {
            await updatePurchaseDetail({
            id: detail.id,
            data: {
                quantity: updatedQuantity,
            },
            });
        }
        }

        message.success('Cập nhật số lượng thành công');
        refetch();
        refetchPurchase();
        setEditableQuantities({});
    } catch (error) {
        message.error('Cập nhật số lượng thất bại');
    }
    };

  const updateQuantity = (key: string, value: number) => {
    setEditableQuantities((prev) => ({
        ...prev,
        [key]: value,
    }));
    };


  return (
    <Modal
      visible={visible}
      title="Chi tiết sản phẩm mua hàng"
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>Nhập ngưỡng tồn kho (lọc sản phẩm có tồn kho thấp hơn giá trị này) </div>
            <InputNumber
                min={0}
                value={tempThreshold}
                onChange={(value) => setTempThreshold(value || 0)}
                placeholder="Nhập ngưỡng tồn kho"
                style={{ width: 200 }}
                disabled={data && data.length > 0}
                />
                <Button
                type="primary"
                onClick={() => setThreshold(tempThreshold)}
                disabled={threshold === tempThreshold || (data && data.length > 0)}
                >
                Xác nhận ngưỡng
                </Button>
        </div>

      </div>

      {isLoading ? (
        <Spin size="large" />
      ) : (
      <Table
        columns={data && data.length > 0 ? columnsFromAPI : columnsFromFlattenedProducts}
        dataSource={data && data.length > 0 ? data : flattenedProductRows}
        rowKey="id"
        pagination={false}
        />
        
      )}
      {status !== 'COMPLETED' && (
            <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Button
                type="primary"
                onClick={data && data.length > 0 ? handleUpdateQuantities : handleAddQuantityToStock}
                disabled={status === 'CANCELLED'}
                >
                {data && data.length > 0
                    ? 'Cập nhật số lượng mới vào kho'
                    : 'Thêm số lượng mới vào kho'}
                </Button>
            </div>
            )}
    </Modal>
  );
};

export default PurchaseDetailModal;
