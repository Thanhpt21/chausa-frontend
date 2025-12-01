import React, { useEffect } from 'react';
import { Modal, message, Spin, Typography, Divider, Table } from 'antd';
import { useColorQuantityByProductId } from '@/hooks/product/useColorQuantityByProductId';

const { Paragraph, Text } = Typography;

interface InventoryModalProps {
  productId: number;
  visible: boolean;
  onClose: () => void;
}

interface StockItem {
  color: number;
  colorTitle: string;
  size: string;
  importedQuantity: number;
  exportedAndTransferredQuantity: number;
  remainingQuantity: number;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  productId,
  visible,
  onClose,
}) => {
  // Gọi hook lấy số lượng tồn kho của sản phẩm theo màu sắc và size
  const { data, isLoading, isError } = useColorQuantityByProductId(productId);

  // Khi modal mở, gọi lại API để lấy dữ liệu mới nhất
  useEffect(() => {
    if (visible) {
      // Hook sẽ tự động gọi API khi visible thay đổi
    }
  }, [visible]);

  // Xử lý lỗi khi có sự cố trong việc gọi API
  if (isError) {
    message.error('Lỗi khi tải số lượng tồn kho sản phẩm theo màu sắc');
  }

  // Tính tổng số lượng nhập, xuất và còn lại
  const totalImportedQuantity = data?.data?.reduce((sum, item) => sum + item.importedQuantity, 0) || 0;
  const totalExportedQuantity = data?.data?.reduce((sum, item) => sum + item.exportedAndTransferredQuantity, 0) || 0;
  const totalRemainingQuantity = data?.data?.reduce((sum, item) => sum + item.remainingQuantity, 0) || 0;

  // Nhóm dữ liệu theo màu để hiển thị
  const groupByColor = (data: StockItem[]) => {
    const grouped: { [key: string]: StockItem[] } = {};
    
    data?.forEach(item => {
      if (!grouped[item.colorTitle]) {
        grouped[item.colorTitle] = [];
      }
      grouped[item.colorTitle].push(item);
    });
    
    return grouped;
  };

  const groupedData = data?.data ? groupByColor(data.data) : {};

  // Columns cho bảng hiển thị size
  const sizeColumns = [
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 80,
    },
    {
      title: 'Đã nhập',
      dataIndex: 'importedQuantity',
      key: 'importedQuantity',
      width: 100,
      render: (quantity: number) => (
        <Text type={quantity > 0 ? undefined : 'secondary'}>
          {quantity}
        </Text>
      ),
    },
    {
      title: 'Đã xuất',
      dataIndex: 'exportedAndTransferredQuantity',
      key: 'exportedAndTransferredQuantity',
      width: 100,
      render: (quantity: number) => (
        <Text type={quantity > 0 ? undefined : 'secondary'}>
          {quantity}
        </Text>
      ),
    },
    {
      title: 'Còn lại',
      dataIndex: 'remainingQuantity',
      key: 'remainingQuantity',
      width: 100,
      render: (quantity: number) => (
        <Text 
          strong 
          type={quantity > 0 ? 'success' : quantity === 0 ? 'warning' : 'danger'}
        >
          {quantity}
        </Text>
      ),
    },
  ];

  return (
    <Modal
      title="Tồn kho sản phẩm theo màu và size"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={800}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : !data?.data?.length ? (
        <Paragraph style={{ textAlign: 'center' }}>
          <Text type="secondary">Không có thông tin tồn kho sản phẩm theo màu sắc và size</Text>
        </Paragraph>
      ) : (
        <>
          {/* Hiển thị theo từng màu với bảng size */}
          {Object.entries(groupedData).map(([colorTitle, items]) => {
            // Tính tổng cho từng màu
            const colorImported = items.reduce((sum, item) => sum + item.importedQuantity, 0);
            const colorExported = items.reduce((sum, item) => sum + item.exportedAndTransferredQuantity, 0);
            const colorRemaining = items.reduce((sum, item) => sum + item.remainingQuantity, 0);

            return (
              <div key={colorTitle} style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                    Màu: {colorTitle}
                  </Text>
                </div>

                {/* Bảng hiển thị các size của màu này */}
                <Table
                  size="small"
                  columns={sizeColumns}
                  dataSource={items.map(item => ({
                    ...item,
                    key: `${colorTitle}-${item.size}`
                  }))}
                  pagination={false}
                  style={{ marginBottom: 16 }}
                />

                {/* Tổng cho màu này */}
                <div style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  marginBottom: '16px'
                }}>
                  <Paragraph style={{ margin: 0 }}>
                    <Text strong>Tổng màu {colorTitle}: </Text>
                    <Text> Đã nhập: {colorImported}</Text>
                    <Text style={{ marginLeft: 16 }}>Đã xuất: {colorExported}</Text>
                    <Text 
                      style={{ marginLeft: 16 }}
                      type={colorRemaining > 0 ? 'success' : 'danger'}
                    >
                      Còn lại: {colorRemaining}
                    </Text>
                  </Paragraph>
                </div>

                <Divider />
              </div>
            );
          })}
          
          {/* Tổng toàn bộ sản phẩm */}
          <div style={{ 
            backgroundColor: '#e6f7ff', 
            padding: '16px', 
            borderRadius: '4px',
            border: '1px solid #91d5ff'
          }}>
            <Paragraph style={{ margin: 0 }}>
              <Text strong style={{ fontSize: '16px' }}>Tổng toàn bộ sản phẩm:</Text>
            </Paragraph>
            <Paragraph style={{ margin: '8px 0 0 0' }}>
              <Text strong>Tổng số lượng nhập: </Text>
              <Text>{totalImportedQuantity}</Text>
            </Paragraph>
            <Paragraph style={{ margin: '4px 0' }}>
              <Text strong>Tổng số lượng xuất: </Text>
              <Text>{totalExportedQuantity}</Text>
            </Paragraph>
            <Paragraph style={{ margin: '4px 0' }}>
              <Text strong>Tổng số lượng còn lại: </Text>
              <Text 
                strong 
                type={totalRemainingQuantity > 0 ? 'success' : totalRemainingQuantity === 0 ? 'warning' : 'danger'}
              >
                {totalRemainingQuantity}
              </Text>
            </Paragraph>
          </div>
        </>
      )}
    </Modal>
  );
};