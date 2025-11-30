import React, { useEffect } from 'react';
import { Modal, message, Spin, Typography, Divider } from 'antd';
import { useColorQuantityByProductId } from '@/hooks/product/useColorQuantityByProductId';

const { Paragraph, Text } = Typography;

interface InventoryModalProps {
  productId: number;
  visible: boolean;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  productId,
  visible,
  onClose,
}) => {
  // Gọi hook lấy số lượng tồn kho của sản phẩm theo màu sắc
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
  const totalImportedQuantity = data?.data.reduce((sum, item) => sum + item.importedQuantity, 0) || 0;
  const totalExportedQuantity = data?.data.reduce((sum, item) => sum + item.exportedAndTransferredQuantity, 0) || 0;
  const totalRemainingQuantity = data?.data.reduce((sum, item) => sum + item.remainingQuantity, 0) || 0;

  return (
    <Modal
      title="Tồn kho sản phẩm theo màu"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={700} // Cải thiện kích thước của modal cho dễ nhìn
    >
      {isLoading ? (
        <Spin size="large" />  // Hiển thị loading khi đang tải dữ liệu
      ) : !data?.data?.length ? (
        <Paragraph>
          <Text type="secondary">Không có thông tin tồn kho sản phẩm theo màu sắc</Text>
        </Paragraph>  // Khi không có dữ liệu
      ) : (
        <>
          {data.data.map((item) => (
            <div key={item.colorTitle}>
              <Paragraph>
                <Text strong>Màu: </Text>{item.colorTitle}
              </Paragraph>

              <Paragraph>
                <Text strong>Số lượng đã nhập: </Text>{item.importedQuantity}
              </Paragraph>

              <Paragraph>
                <Text strong>Số lượng đã xuất: </Text>{item.exportedAndTransferredQuantity}
              </Paragraph>

              <Paragraph>
                <Text strong>Số lượng còn lại: </Text>{item.remainingQuantity}
              </Paragraph>

              <Divider /> {/* Thêm một divider giữa các màu sắc */}
            </div>
          ))}
          
          <Divider />
          <Paragraph>
            <Text strong>Tổng số lượng nhập: </Text>{totalImportedQuantity}
          </Paragraph>
          <Paragraph>
            <Text strong>Tổng số lượng xuất: </Text>{totalExportedQuantity}
          </Paragraph>
          <Paragraph>
            <Text strong>Tổng số lượng còn lại: </Text>{totalRemainingQuantity}
          </Paragraph>
        </>
      )}
    </Modal>
  );
};
