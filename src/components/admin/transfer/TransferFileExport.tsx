import { Modal, Button, notification, Select } from 'antd';
import { useRef, useState, useEffect } from 'react';
import { Transfer } from '@/types/transfer.type';
import { format } from 'date-fns';
import { useAllWarehouses } from '@/hooks/warehouse/useAllWarehouses';
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

  const formattedDate = format(new Date(transfer_date), "'Ngày' dd 'tháng' MM 'năm' yyyy");
  const formattedDateShort = format(new Date(transfer_date), "ddMMyyyy");

  const modalContentRef = useRef<HTMLDivElement | null>(null);

  // State kho xuất, kho nhận
  const [selectedFromWarehouse, setSelectedFromWarehouse] = useState<string | null>(null);

    const handleWarehouseChange = (value: string) => {
    setSelectedFromWarehouse(value); // Cập nhật kho đã chọn
  };

  // Load kho mặc định
  useEffect(() => {
    if (warehouses.length > 0) {
      setSelectedFromWarehouse(warehouses[0].address);
    }
  }, [warehouses]);

  // import html2pdf.js động
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

  return (
    <Modal
      visible={visible}
      title={`Chi tiết Mã đơn hàng #${transferId}`}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="download-pdf"
          type="primary"
          onClick={handleExportToPDF}
          disabled={!html2pdf}
        >
          Tải PDF
        </Button>,
      ]}
      width={793}
      style={{ top: 20 }}
    >
      <div ref={modalContentRef} className='text-xs'>
        <div className="px-5 text-sm">
          <div><strong>CHÂU SA</strong></div>
        </div>

        <div className="px-5 mt-5 flex items-center justify-center">
            <div className='text-base'><strong>MÃ ĐƠN HÀNG</strong></div>
        </div>
        <div className="px-5 flex justify-center italic">{formattedDate}</div>
        <div className="px-5 flex items-center justify-center">
            <div>Số: CS_{customer?.phoneNumber}/{transferId}</div>
        </div>


         <div className='px-5'>
            <div><strong>Họ và tên người nhận hàng:</strong>  {customer?.name}</div>
            <div><strong>Số điện thoại:</strong>  {customer?.phoneNumber}</div>
            <div><strong>Mã số thuế:</strong>  {customer?.mst}</div>
            <div><strong>Địa chỉ nhận hàng:</strong>  {customer?.address}</div>
            <div><strong>Ghi chú:</strong> {transferData.note || ''}</div>
            <div><strong>Người tạo phiếu:</strong> {transferData.user?.name || '-'}</div>
          </div>
          <div className="px-5">
            <div className="flex items-center">
              <div><strong>Địa điểm xuất kho:</strong></div>
              <Select
                defaultValue={selectedFromWarehouse}
                value={selectedFromWarehouse}
                onChange={handleWarehouseChange}
                disabled={!visible} // Disable khi không ở chế độ chỉnh sửa
                style={{ width: '80%' }}
                bordered={false} // Ẩn viền của Select
                suffixIcon={null}
                className={selectedFromWarehouse ? "hidden" : ""} // Ẩn Select sau khi chọn
              >
                {warehouses.map((warehouse) => (
                  <Select.Option key={warehouse.id} value={warehouse.address}>
                    <span className='text-sm'>{warehouse.address}</span>
                  </Select.Option>
                ))}
              </Select>
            
            </div>
          </div>
        <div className="overflow-x-auto px-5 mt-5">
          <table className="pdf-table">
            <thead>
              <tr className="border">
                <th className="px-2 py-2 border text-left  w-[4%]">Stt</th>
                <th className="px-3 py-2 border text-left w-[54%]">Mô tả hàng hóa</th>
                <th className="px-3 py-2 border text-left w-[8%]">Model</th>
                <th className="px-3 py-2 border text-left w-[8%]">Ghi chú</th>
                <th className="px-3 py-2 border text-left w-[8%]">Đơn vị</th>
                <th className="px-3 py-2 text-left border w-[5%]">SL hợp đồng</th> 
                <th className="px-3 py-2 border text-left w-[12%]">Đơn giá</th>
                <th className="px-3 py-2 border text-left w-[12%]">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {transferDetails?.map((item, idx) => (
                <tr key={item.id} className="border-b">
                  <td className="px-2 py-2 border">{idx + 1}</td>
                   <td className="px-3 py-2 border description-cell">
                    <div>{item?.product?.title || '-'}</div>
                   <div
                      dangerouslySetInnerHTML={{
                        __html: `<div style="margin: 0; white-space: normal;"><style>p { margin: 0; }</style>${(item?.product?.description || '').replace(/\n/g, '<br />')}</div>`,
                      }}
                    />
                  </td>
                  <td className="px-3 py-2 border">{item.product.sku || '-'}</td>
                  <td className="px-3 py-2 border">{item.colorTitle || '-'}</td>
                  <td className="px-3 py-2 border">{item.product.unit || '-'}</td>
                  <td className="px-3 py-2 border">{item.quantity}</td>
                  <td className="px-3 py-2 border">{formatVND(item.unitPrice)}</td>
                  <td className="px-3 py-2 border">{formatVND(item.finalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
            <div className='px-5 flex justify-end'>
            <div className="w-full py-4">
              <div className="flex justify-between">
                <div><strong>Tổng cộng :</strong></div>
                <div>{formatVND(transferData.total_amount)}</div>
              </div>
              
            </div>
          </div>
          <div className='px-5'>
            Số chứng từ kèm theo ............................................................................................
          </div>

        <div className="px-5 mt-8 grid grid-cols-4 gap-5 text-center text-sm">
          <div>
            <div className="font-bold">NGƯỜI NHẬN HÀNG</div>
            <div>(Ký, họ tên)</div>
          </div>
          <div>
            <div className="font-bold">THỦ KHO</div>
            <div>(Ký, họ tên)</div>
          </div>
          <div>
            <div className="font-bold">NGƯỜI LẬP BIỂU</div>
            <div>(Ký, họ tên)</div>
          </div>
          <div>
            <div className="font-bold">THỦ TRƯỞNG</div>
            <div>(Ký, họ tên)</div>
          </div>
        </div>

        <div style={{ height: 60 }} /> {/* khoảng trống cho chữ ký */}
      </div>
    </Modal>
  );
};

export default TransferFileExport;