'use client';

import { Modal, Button, notification, Spin } from 'antd';
import { useRef, useState, useEffect } from 'react';
import { Transfer } from '@/types/transfer.type';
import { format } from 'date-fns';
import { useTransferOrderDetailsByTransferId } from '@/hooks/transfer-order-detail/useTransferOrderDetailsByTransferId';
import { formatVND } from '@/utils/helpers';

interface TransferFileExportProps {
  visible: boolean;
  transferId: number;
  transferData: Transfer | null;
  onClose: () => void;
}

const TransferFileExport = ({
  visible,
  transferId,
  transferData,
  onClose,
}: TransferFileExportProps) => {
  if (!transferData) return null;

  const { transfer_date, transferDetails, total_amount, user, customer } = transferData;

  const { data: orderedDetails = [], isLoading: isLoadingOrdered } = useTransferOrderDetailsByTransferId(transferId);

  const formattedDate = format(new Date(transfer_date), "'Ngày' dd 'tháng' MM 'năm' yyyy");
  const formattedDateShort = format(new Date(transfer_date), "ddMMyyyy");

  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [html2pdf, setHtml2pdf] = useState<any>(null);
  
  useEffect(() => {
    import('html2pdf.js')
      .then((module) => {
        console.log('html2pdf loaded successfully');
        setHtml2pdf(() => module.default);
      })
      .catch((error) => {
        console.error("Failed to load html2pdf.js:", error);
        notification.error({
          message: 'Lỗi tải thư viện',
          description: 'Không thể tải thư viện xuất PDF. Vui lòng thử lại.',
        });
      });
  }, []);

  const handleExportToPDF = async () => {
    if (!html2pdf) {
      notification.warn({
        message: 'Thư viện chưa sẵn sàng',
        description: 'Vui lòng chờ một chút để thư viện xuất PDF được tải.',
      });
      return;
    }

    if (!modalContentRef.current) {
      notification.error({
        message: 'Lỗi',
        description: 'Không tìm thấy nội dung để xuất.',
      });
      return;
    }

    try {
      setIsExporting(true);

      const options = {
        margin: [10, 10, 10, 10],
        filename: `Don_ma_hang_${transferData.note}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
      };

      await html2pdf()
        .from(modalContentRef.current)
        .set(options)
        .save();

      notification.success({
        message: 'Thành công',
        description: 'Đã tải xuống file PDF.',
      });

    } catch (error) {
      console.error('Error exporting PDF:', error);
      notification.error({
        message: 'Lỗi xuất PDF',
        description: 'Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // === TÍNH TOÁN CHÊNH LỆCH ===
  type ItemKey = string;

  const orderedMap = new Map<ItemKey, number>();
  const actualMap = new Map<ItemKey, number>();
  const itemInfoMap = new Map<ItemKey, any>();

  orderedDetails.forEach((item: any) => {
    const key = `${item.product?.title || 'N/A'} | ${item.colorTitle || '-'} | ${item.size || '-'}`;
    orderedMap.set(key, (orderedMap.get(key) || 0) + item.quantity);
    itemInfoMap.set(key, {
      title: item.product?.title || '-',
      sku: item.product?.sku || '-',
      colorTitle: item.colorTitle || '-',
      size: item.size || '-',
      unit: item.product?.unit || '-',
      unitPrice: item.unitPrice || 0,
    });
  });

  transferDetails?.forEach((item: any) => {
    const key = `${item.product?.title || 'N/A'} | ${item.colorTitle || '-'} | ${item.size || '-'}`;
    actualMap.set(key, (actualMap.get(key) || 0) + item.quantity);
    if (!itemInfoMap.has(key)) {
      itemInfoMap.set(key, {
        title: item.product?.title || '-',
        sku: item.product?.sku || '-',
        colorTitle: item.colorTitle || '-',
        size: item.size || '-',
        unit: item.product?.unit || '-',
        unitPrice: item.unitPrice || 0,
      });
    }
  });

  const diffItems = Array.from(new Set([...orderedMap.keys(), ...actualMap.keys()]))
    .map(key => {
      const ordered = orderedMap.get(key) || 0;
      const actual = actualMap.get(key) || 0;
      const diff = actual - ordered;
      return {
        key,
        info: itemInfoMap.get(key),
        ordered,
        actual,
        diff,
      };
    })
    .sort((a, b) => {
      if (a.diff !== b.diff) return a.diff - b.diff;
      return a.info.title.localeCompare(b.info.title);
    });

  const hasDifference = diffItems.some(item => item.diff !== 0);

  const totalOrderedQuantity = orderedDetails.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  const totalActualQuantity = transferDetails?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  // Inline styles cho table
  const thStyle: React.CSSProperties = {
    padding: '8px',
    border: '1px solid #ddd',
    textAlign: 'left',
    fontWeight: 'bold'
  };

  const tdStyle: React.CSSProperties = {
    padding: '8px',
    border: '1px solid #ddd'
  };

  return (
    <Modal
      open={visible}
      title={`Chi tiết mã đơn hàng`}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>Đóng</Button>,
        <Button 
          key="download-pdf" 
          type="primary" 
          onClick={handleExportToPDF} 
          disabled={!html2pdf || isExporting}
          loading={isExporting}
        >
          {isExporting ? 'Đang xuất...' : 'Tải PDF'}
        </Button>,
      ]}
      width={1100}
      style={{ top: 20 }}
    >
      <div ref={modalContentRef} style={{ fontSize: '12px', lineHeight: '1.5' }}>
        {/* Header */}
        <div style={{ padding: '0 20px', fontSize: '14px' }}>
          <strong>CHÂU SA</strong>
        </div>
        <div style={{ padding: '0 20px', marginTop: '20px', textAlign: 'center', fontSize: '16px' }}>
          <strong>PHIẾU XUẤT KHO</strong>
        </div>
        <div style={{ padding: '0 20px', textAlign: 'center', fontStyle: 'italic' }}>
          {formattedDate}
        </div>
        <div style={{ padding: '0 20px', textAlign: 'center' }}>
          Số: CS_{customer?.phoneNumber}/{transferId}
        </div>

        <div style={{ padding: '0 20px', marginTop: '16px' }}>
          <div><strong>Đơn mã hàng:</strong> {transferData.note || '-'}</div>
          <div><strong>Họ và tên người nhận:</strong> {customer?.name || '-'}</div>
          <div><strong>Số điện thoại:</strong> {customer?.phoneNumber || '-'}</div>
          <div><strong>Mã số thuế:</strong> {customer?.mst || '-'}</div>
          <div><strong>Địa chỉ nhận hàng:</strong> {customer?.address || '-'}</div>
          <div><strong>Người lập phiếu:</strong> {user?.name || '-'}</div>
        </div>

        {/* BẢNG 1: CHI TIẾT ĐẶT HÀNG */}
        {isLoadingOrdered ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}><Spin /></div>
        ) : (
          <>
            <div style={{ padding: '0 20px', marginTop: '24px' }}>
              <strong>1. CHI TIẾT ĐẶT HÀNG</strong>
            </div>
            <div style={{ padding: '0 20px', marginTop: '8px', overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                border: '1px solid #ddd'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ ...thStyle, width: '5%' }}>STT</th>
                    <th style={{ ...thStyle, width: '35%' }}>Tên sản phẩm</th>
                    <th style={{ ...thStyle, width: '10%' }}>Model</th>
                    <th style={{ ...thStyle, width: '10%' }}>Màu</th>
                    <th style={{ ...thStyle, width: '8%' }}>Size</th>
                    <th style={{ ...thStyle, width: '8%' }}>SL đặt</th>
                    <th style={{ ...thStyle, width: '12%' }}>Đơn giá</th>
                    <th style={{ ...thStyle, width: '12%' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedDetails.map((item: any, idx: number) => (
                    <tr key={item.id}>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{idx + 1}</td>
                      <td style={tdStyle}>{item.product?.title || '-'}</td>
                      <td style={tdStyle}>{item.product?.sku || '-'}</td>
                      <td style={tdStyle}>{item.colorTitle || '-'}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{item.size || '-'}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{formatVND(item.unitPrice)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{formatVND(item.finalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 'bold' }}>
                    <td colSpan={5} style={{ ...tdStyle, textAlign: 'right' }}>Tổng:</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{totalOrderedQuantity}</td>
                    <td style={tdStyle}></td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      {formatVND(orderedDetails.reduce((s: number, i: any) => s + (i.finalPrice || 0), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {/* BẢNG 2: CHI TIẾT XUẤT KHO THỰC TẾ */}
        <div style={{ padding: '0 20px', marginTop: '32px' }}>
          <strong>2. CHI TIẾT XUẤT KHO THỰC TẾ</strong>
        </div>
        <div style={{ padding: '0 20px', marginTop: '8px', overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            border: '1px solid #ddd'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ ...thStyle, width: '5%' }}>STT</th>
                <th style={{ ...thStyle, width: '35%' }}>Tên sản phẩm</th>
                <th style={{ ...thStyle, width: '10%' }}>Model</th>
                <th style={{ ...thStyle, width: '10%' }}>Màu</th>
                <th style={{ ...thStyle, width: '8%' }}>Size</th>
                <th style={{ ...thStyle, width: '8%' }}>SL giao</th>
                <th style={{ ...thStyle, width: '12%' }}>Đơn giá</th>
                <th style={{ ...thStyle, width: '12%' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {transferDetails?.map((item: any, idx: number) => (
                <tr key={item.id}>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{idx + 1}</td>
                  <td style={tdStyle}>{item.product?.title || '-'}</td>
                  <td style={tdStyle}>{item.product?.sku || '-'}</td>
                  <td style={tdStyle}>{item.colorTitle || '-'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{item.size || '-'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatVND(item.unitPrice)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatVND(item.finalPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={5} style={{ ...tdStyle, textAlign: 'right' }}>Tổng:</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{totalActualQuantity}</td>
                <td style={tdStyle}></td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatVND(total_amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* BẢNG 3: CHÊNH LỆCH */}
        {hasDifference && (
          <>
            <div style={{ padding: '0 20px', marginTop: '32px' }}>
              <strong style={{ color: 'red' }}>3. CHÊNH LỆCH GIỮA ĐẶT HÀNG VÀ XUẤT KHO</strong> ({transferData.note || '-'})
            </div>
            <div style={{ padding: '0 20px', marginTop: '8px', overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                border: '1px solid #ddd'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#fee' }}>
                    <th style={{ ...thStyle, width: '5%' }}>STT</th>
                    <th style={{ ...thStyle, width: '35%' }}>Sản phẩm</th>
                    <th style={{ ...thStyle, width: '10%' }}>Model</th>
                    <th style={{ ...thStyle, width: '10%' }}>Màu</th>
                    <th style={{ ...thStyle, width: '8%' }}>Size</th>
                    <th style={{ ...thStyle, width: '10%', textAlign: 'center' }}>SL đặt</th>
                    <th style={{ ...thStyle, width: '10%', textAlign: 'center' }}>SL giao</th>
                    <th style={{ ...thStyle, width: '12%', textAlign: 'center' }}>Chênh lệch</th>
                  </tr>
                </thead>
                <tbody>
                  {diffItems.map((item, idx) => {
                    const bgColor = item.diff < 0 ? '#fee' : item.diff > 0 ? '#ffb' : '#efe';
                    const textColor = item.diff < 0 ? 'red' : item.diff > 0 ? 'orange' : 'green';
                    return (
                      <tr key={item.key} style={{ backgroundColor: bgColor }}>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{idx + 1}</td>
                        <td style={tdStyle}>{item.info.title}</td>
                        <td style={tdStyle}>{item.info.sku}</td>
                        <td style={tdStyle}>{item.info.colorTitle}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{item.info.size}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{item.ordered}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{item.actual}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', color: textColor }}>
                          {item.diff > 0 ? `+${item.diff}` : item.diff}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ padding: '0 20px', marginTop: '32px' }}>
          Số chứng từ kèm theo ............................................................................................
        </div>

        <div style={{ padding: '0 20px', marginTop: '48px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', textAlign: 'center' }}>
          <div><strong>NGƯỜI NHẬN HÀNG</strong><br />(Ký, họ tên)</div>
          <div><strong>THỦ KHO</strong><br />(Ký, họ tên)</div>
          <div><strong>NGƯỜI LẬP PHIẾU</strong><br />(Ký, họ tên)</div>
          <div><strong>THỦ TRƯỞNG ĐƠN VỊ</strong><br />(Ký, họ tên)</div>
        </div>

        <div style={{ height: '80px' }} />
      </div>
    </Modal>
  );
};

export default TransferFileExport;