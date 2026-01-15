'use client';

import { Modal, Button, notification, Select, Spin } from 'antd';
import { useRef, useState, useEffect } from 'react';
import { Transfer } from '@/types/transfer.type';
import { format } from 'date-fns';
import { useAllWarehouses } from '@/hooks/warehouse/useAllWarehouses';
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

  const { data: warehouses = [] } = useAllWarehouses({});
  const { data: orderedDetails = [], isLoading: isLoadingOrdered } = useTransferOrderDetailsByTransferId(transferId);

  const formattedDate = format(new Date(transfer_date), "'Ngày' dd 'tháng' MM 'năm' yyyy");
  const formattedDateShort = format(new Date(transfer_date), "ddMMyyyy");

  const modalContentRef = useRef<HTMLDivElement | null>(null);

  const [selectedFromWarehouse, setSelectedFromWarehouse] = useState<string | null>(null);

  const handleWarehouseChange = (value: string) => {
    setSelectedFromWarehouse(value);
  };

  useEffect(() => {
    if (warehouses.length > 0 && !selectedFromWarehouse) {
      setSelectedFromWarehouse(warehouses[0].address);
    }
  }, [warehouses, selectedFromWarehouse]);

  const [html2pdf, setHtml2pdf] = useState<any>(null);
  useEffect(() => {
    import('html2pdf.js')
      .then((module) => setHtml2pdf(() => module.default))
      .catch((error) => {
        console.error("Failed to load html2pdf.js:", error);
        notification.error({
          message: 'Lỗi tải thư viện',
          description: 'Không thể tải thư viện xuất PDF. Vui lòng thử lại.',
        });
      });
  }, []);

  const handleExportToPDF = () => {
    if (modalContentRef.current && html2pdf) {
      const options = {
        margin: 10,
        filename: `E_Xuat_kho_${formattedDateShort}_${transferId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      html2pdf()
        .from(modalContentRef.current)
        .set(options)
        .save();
    } else if (!html2pdf) {
      notification.warn({
        message: 'Thư viện chưa sẵn sàng',
        description: 'Vui lòng chờ một chút để thư viện xuất PDF được tải.',
      });
    }
  };

  // === TÍNH TOÁN CHÊNH LỆCH ===
  type ItemKey = string; // "title | colorTitle | size"

  const orderedMap = new Map<ItemKey, number>();
  const actualMap = new Map<ItemKey, number>();
  const itemInfoMap = new Map<ItemKey, any>(); // lưu thông tin để hiển thị

  // Gom dữ liệu đặt hàng
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

  // Gom dữ liệu xuất kho thực tế
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

  // Tạo danh sách chênh lệch
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
      // Sắp xếp: thiếu trước, rồi đủ, rồi thừa
      if (a.diff !== b.diff) return a.diff - b.diff;
      return a.info.title.localeCompare(b.info.title);
    });

  const hasDifference = diffItems.some(item => item.diff !== 0);

  // Tổng số lượng
  const totalOrderedQuantity = orderedDetails.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  const totalActualQuantity = transferDetails?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  return (
    <Modal
      visible={visible}
      title={`Chi tiết Mã đơn hàng #${transferId}`}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>Đóng</Button>,
        <Button key="download-pdf" type="primary" onClick={handleExportToPDF} disabled={!html2pdf}>
          Tải PDF
        </Button>,
      ]}
      width={1100}
      style={{ top: 20 }}
    >
      <div ref={modalContentRef} className="text-xs">
        {/* Header */}
        <div className="px-5 text-sm"><strong>CHÂU SA</strong></div>
        <div className="px-5 mt-5 text-center text-base"><strong>PHIẾU XUẤT KHO</strong></div>
        <div className="px-5 text-center italic">{formattedDate}</div>
        <div className="px-5 text-center">Số: CS_{customer?.phoneNumber}/{transferId}</div>

        <div className="px-5 mt-4">
          <div><strong>Đơn mã hàng:</strong> {transferData.note || '-'}</div>
          <div><strong>Họ và tên người nhận:</strong> {customer?.name || '-'}</div>
          <div><strong>Số điện thoại:</strong> {customer?.phoneNumber || '-'}</div>
          <div><strong>Mã số thuế:</strong> {customer?.mst || '-'}</div>
          <div><strong>Địa chỉ nhận hàng:</strong> {customer?.address || '-'}</div>
          <div><strong>Người lập phiếu:</strong> {user?.name || '-'}</div>
        </div>

        <div className="px-5 mt-3 flex items-center">
          <strong>Địa điểm xuất kho:</strong>
          <Select
            value={selectedFromWarehouse}
            onChange={handleWarehouseChange}
            disabled={!visible}
            style={{ width: '70%' }}
            bordered={false}
            suffixIcon={null}
          >
            {warehouses.map((w) => (
              <Select.Option key={w.id} value={w.address}>
                {w.address}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* BẢNG 1: CHI TIẾT ĐẶT HÀNG */}
        {isLoadingOrdered ? (
          <div className="text-center py-8"><Spin /></div>
        ) : (
          <>
            <div className="px-5 mt-6"><strong>1. CHI TIẾT ĐẶT HÀNG</strong></div>
            <div className="overflow-x-auto px-5 mt-2">
              <table className="pdf-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border bg-gray-100">
                    <th className="px-2 py-2 border text-left" style={{ width: '5%' }}>STT</th>
                    <th className="px-2 py-2 border text-left" style={{ width: '35%' }}>Tên sản phẩm</th>
                    <th className="px-2 py-2 border text-left" style={{ width: '10%' }}>Model</th>
                    <th className="px-2 py-2 border text-left" style={{ width: '10%' }}>Màu</th>
                    <th className="px-2 py-2 border text-left" style={{ width: '8%' }}>Size</th>
                    <th className="px-2 py-2 border text-left" style={{ width: '8%' }}>SL đặt</th>
                    <th className="px-2 py-2 border text-left" style={{ width: '12%' }}>Đơn giá</th>
                    <th className="px-2 py-2 border text-left" style={{ width: '12%' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedDetails.map((item: any, idx: number) => (
                    <tr key={item.id}>
                      <td className="px-2 py-2 border text-center">{idx + 1}</td>
                      <td className="px-2 py-2 border">{item.product?.title || '-'}</td>
                      <td className="px-2 py-2 border">{item.product?.sku || '-'}</td>
                      <td className="px-2 py-2 border">{item.colorTitle || '-'}</td>
                      <td className="px-2 py-2 border text-center">{item.size || '-'}</td>
                      <td className="px-2 py-2 border text-center">{item.quantity}</td>
                      <td className="px-2 py-2 border text-right">{formatVND(item.unitPrice)}</td>
                      <td className="px-2 py-2 border text-right">{formatVND(item.finalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t font-bold">
                    <td colSpan={5} className="px-2 py-2 border text-right">Tổng:</td>
                    <td className="px-2 py-2 border text-center">{totalOrderedQuantity}</td>
                    <td className="px-2 py-2 border"></td>
                    <td className="px-2 py-2 border text-right">
                      {formatVND(orderedDetails.reduce((s: number, i: any) => s + (i.finalPrice || 0), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {/* BẢNG 2: CHI TIẾT XUẤT KHO THỰC TẾ */}
        <div className="px-5 mt-8"><strong>2. CHI TIẾT XUẤT KHO THỰC TẾ </strong></div>
        <div className="overflow-x-auto px-5 mt-2">
          <table className="pdf-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="border bg-gray-100">
                <th className="px-2 py-2 border text-left" style={{ width: '5%' }}>STT</th>
                <th className="px-2 py-2 border text-left" style={{ width: '35%' }}>Tên sản phẩm</th>
                <th className="px-2 py-2 border text-left" style={{ width: '10%' }}>Model</th>
                <th className="px-2 py-2 border text-left" style={{ width: '10%' }}>Màu</th>
                <th className="px-2 py-2 border text-left" style={{ width: '8%' }}>Size</th>
                <th className="px-2 py-2 border text-left" style={{ width: '8%' }}>SL giao</th>
                <th className="px-2 py-2 border text-left" style={{ width: '12%' }}>Đơn giá</th>
                <th className="px-2 py-2 border text-left" style={{ width: '12%' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {transferDetails?.map((item: any, idx: number) => (
                <tr key={item.id}>
                  <td className="px-2 py-2 border text-center">{idx + 1}</td>
                  <td className="px-2 py-2 border">{item.product?.title || '-'}</td>
                  <td className="px-2 py-2 border">{item.product?.sku || '-'}</td>
                  <td className="px-2 py-2 border">{item.colorTitle || '-'}</td>
                  <td className="px-2 py-2 border text-center">{item.size || '-'}</td>
                  <td className="px-2 py-2 border text-center">{item.quantity}</td>
                  <td className="px-2 py-2 border text-right">{formatVND(item.unitPrice)}</td>
                  <td className="px-2 py-2 border text-right">{formatVND(item.finalPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t font-bold">
                <td colSpan={5} className="px-2 py-2 border text-right">Tổng:</td>
                <td className="px-2 py-2 border text-center">{totalActualQuantity}</td>
                <td className="px-2 py-2 border"></td>
                <td className="px-2 py-2 border text-right">{formatVND(total_amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* BẢNG 3: CHÊNH LỆCH */}
        {hasDifference && (
          <>
            <div className="px-5 mt-8"><strong style={{ color: 'red' }}>3. CHÊNH LỆCH GIỮA ĐẶT HÀNG VÀ XUẤT KHO </strong> ({transferData.note || '-'})</div>
            <div className="overflow-x-auto px-5 mt-2">
              <table className="pdf-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border bg-red-50">
                    <th className="px-2 py-2 border text-left" style={{ width: '5%' }}>STT</th>
                    <th className="px-2 py-2 border text-left" style={{ width: '35%' }}>Sản phẩm</th>
                    <th className="px-2 py-2 border text-left" style={{ width: '10%' }}>Model</th>
                    <th className="px-2 py-2 border text-left" style={{ width: '10%' }}>Màu</th>
                    <th className="px-2 py-2 border text-left" style={{ width: '8%' }}>Size</th>
                    <th className="px-2 py-2 border text-center" style={{ width: '10%' }}>SL đặt</th>
                    <th className="px-2 py-2 border text-center" style={{ width: '10%' }}>SL giao</th>
                    <th className="px-2 py-2 border text-center font-bold" style={{ width: '12%' }}>Chênh lệch</th>
                  </tr>
                </thead>
                <tbody>
                  {diffItems.map((item, idx) => {
                    const bgColor = item.diff < 0 ? '#fee' : item.diff > 0 ? '#ffb' : '#efe';
                    return (
                      <tr key={item.key} style={{ backgroundColor: bgColor }}>
                        <td className="px-2 py-2 border text-center">{idx + 1}</td>
                        <td className="px-2 py-2 border">{item.info.title}</td>
                        <td className="px-2 py-2 border">{item.info.sku}</td>
                        <td className="px-2 py-2 border">{item.info.colorTitle}</td>
                        <td className="px-2 py-2 border text-center">{item.info.size}</td>
                        <td className="px-2 py-2 border text-center">{item.ordered}</td>
                        <td className="px-2 py-2 border text-center">{item.actual}</td>
                        <td className="px-2 py-2 border text-center font-bold" style={{ color: item.diff < 0 ? 'red' : item.diff > 0 ? 'orange' : 'green' }}>
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
        <div className="px-5 mt-8">
          Số chứng từ kèm theo ............................................................................................
        </div>

        <div className="px-5 mt-12 grid grid-cols-4 gap-8 text-center">
          <div><strong>NGƯỜI NHẬN HÀNG</strong><br />(Ký, họ tên)</div>
          <div><strong>THỦ KHO</strong><br />(Ký, họ tên)</div>
          <div><strong>NGƯỜI LẬP PHIẾU</strong><br />(Ký, họ tên)</div>
          <div><strong>THỦ TRƯỞNG ĐƠN VỊ</strong><br />(Ký, họ tên)</div>
        </div>

        <div style={{ height: 80 }} />
      </div>
    </Modal>
  );
};

export default TransferFileExport;