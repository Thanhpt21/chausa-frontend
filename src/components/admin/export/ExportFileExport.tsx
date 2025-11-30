import { Modal, Button, notification, Select } from 'antd';
import { useRef, useState, useEffect } from 'react'; // Import useEffect
import { Export, ExportStatus } from '@/types/export.type';
import { formatVND } from '@/utils/helpers';
import { format } from 'date-fns';
import { useAllWarehouses } from '@/hooks/warehouse/useAllWarehouses';

interface ExportFileExportProps {
  visible: boolean;
  exportId: number;
  exportData: Export | null;
  onClose: () => void;
}

const ExportFileExport = ({
  visible,
  exportId,
  onClose,
  exportData,
}: ExportFileExportProps) => {
  if (!exportData) {
    return null;
  }

  const { customer, export_date, exportDetails } = exportData;
    const { data: warehouses = [] } = useAllWarehouses({});

  const formattedDate = format(new Date(exportData.export_date), "'Ngày' dd 'tháng' MM 'năm' yyyy");
  const formattedDateHD = format(new Date(exportData.export_date), "ddMMyyyy");


  const modalContentRef = useRef(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);

  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(warehouses[0].address);
    }
  }, [warehouses, selectedWarehouse]);

  // ✅ Use state to hold html2pdf and import it dynamically
  const [html2pdf, setHtml2pdf] = useState<any>(null);

  useEffect(() => {
    // Dynamically import html2pdf.js only on the client-side
    // This ensures it's not bundled or run during SSR
    import('html2pdf.js')
      .then((module) => {
        setHtml2pdf(() => module.default); // html2pdf.js exports a default function
      })
      .catch((error) => {
        console.error("Failed to load html2pdf.js:", error);
        notification.error({
          message: 'Lỗi tải thư viện',
          description: 'Không thể tải thư viện xuất PDF. Vui lòng thử lại.',
        });
      });
  }, []); // Run once on component mount (client-side)

  const handleExportToPDF = () => {
    if (modalContentRef.current && html2pdf) { // Ensure html2pdf is loaded
      const options = {
        margin: 10,
        filename: `Xuất_kho_${exportData.customer.phoneNumber}_${formattedDateHD}_${exportId}.pdf`,
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

  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value); // Cập nhật kho đã chọn
  };

  return (
    <Modal
      visible={visible}
      title={`Chi tiết file xuất kho #${exportId}`}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="download-pdf"
          type="primary"
          onClick={handleExportToPDF}
          disabled={!html2pdf} // Disable button until html2pdf is loaded
        >
          Tải PDF
        </Button>,
      ]}
      width={793}
      style={{ top: 20 }}
    >
      <div ref={modalContentRef} className='text-xs'>
          <div className="px-5">
            <div className="text-sm">
              <div><strong>CÔNG TY TNHH GIẢI PHÁP KỸ THUẬT EIT</strong></div>
              <div><strong>Địa chỉ:</strong> 37 Nguyễn Văn Huyên, phường Phú Thọ Hoà, TP.HCM</div>
              <div><strong>Website:</strong> www.eitsmart.com.vn</div>
            </div>
          </div>
          <div className="px-5 mt-5 flex items-center justify-center">
              <div className='text-base'><strong>PHIẾU XUẤT KHO / GIAO HÀNG</strong></div>
          </div>
           <div className="px-5 flex items-center justify-center">
               <i>{formattedDate}</i>
          </div>
            <div className="px-5 flex items-center justify-center">
               <div>Số: XK_{customer?.phoneNumber}/{exportId}</div>
          </div>
          <div className='px-5'>
            <div><strong>Họ và tên người nhận hàng:</strong>  {customer?.name}</div>
            <div><strong>Số điện thoại:</strong>  {customer?.phoneNumber}</div>
            <div><strong>Mã số thuế:</strong>  {customer?.mst}</div>
            <div><strong>Địa chỉ nhận hàng:</strong>  {customer?.address}</div>
              <div><strong>Ghi chú:</strong> {exportData.note || ''}</div>
            <div><strong>Người tạo phiếu:</strong> {exportData.user?.name || '-'}</div>
          </div>
          <div className="px-5">
            <div className="flex items-center">
              <div><strong>Địa điểm xuất kho:</strong></div>
              <Select
                defaultValue={selectedWarehouse}
                value={selectedWarehouse}
                onChange={handleWarehouseChange}
                disabled={!visible} // Disable khi không ở chế độ chỉnh sửa
                style={{ width: '80%' }}
                bordered={false} // Ẩn viền của Select
                suffixIcon={null}
                className={selectedWarehouse ? "hidden" : ""} // Ẩn Select sau khi chọn
              >
                {warehouses.map((warehouse) => (
                  <Select.Option key={warehouse.id} value={warehouse.address}>
                    {warehouse.address}
                  </Select.Option>
                ))}
              </Select>
            
            </div>
          </div>

          <div className="overflow-x-auto px-5 mt-2 text-sx">
            <table className="pdf-table">
              <thead>
                <tr className="border">
                 <th className="border w-[4%]">Stt</th>
                <th className="border w-[50%]">Mô tả hàng hóa</th>
                <th className="border w-[8%]">Model</th>
                <th className="border w-[8%]">Ghi chú</th>
                <th className="border w-[8%]">ĐV</th>
                <th className="border w-[5%]">SL hợp đồng</th>
                <th className="border w-[5%]">SL thực xuất</th>
                <th className="border w-[12%]">Đơn giá</th>
                <th className="border w-[12%]">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {exportDetails?.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-1 py-2 border">{index + 1}</td>
                    <td className="px-3 py-2 border description-cell">
                      <div>{item?.product?.title || '-'}</div>
                    <div
                        dangerouslySetInnerHTML={{
                          __html: `<div style="margin: 0; white-space: normal;"><style>p { margin: 0; }</style>${(item?.product?.description || '').replace(/\n/g, '<br />')}</div>`,
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 border">{item?.product?.sku || '-'}</td>
                    <td className="px-3 py-2 border">{item.colorTitle || '-'}</td>
                    <td className="px-3 py-2 border">{item?.product?.unit || '-'}</td>
                    <td className="px-3 py-2 border">{item.quantity}</td>
                    <td className="px-3 py-2 border">{item.quantity}</td>
                    <td className="px-1 py-2 border">{((item.unitPrice) - (item.unitPrice * item.discountPercent) / 100).toLocaleString('vi-VN')}</td>
                    <td className="px-1 py-2 border">
                     {(item.finalPrice).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='px-5 flex justify-end'>
            <div className="w-full">
              <div className="flex justify-between">
                <div><strong>Tổng cộng trước thuế:</strong></div>
                <div>{formatVND(exportData.total_amount)}</div>
              </div>
              {exportData.vat && exportData.vat > 0 ? (
                <div className="flex justify-between">
                  <div><strong>Thuế VAT ({exportData.vat}%):</strong></div>
                  <div>{formatVND(exportData.vat_amount ?? 0)}</div>
                </div>
              ) : exportData.pitRate && exportData.pitRate > 0 ? (
                <div className="flex justify-between">
                  <div><strong>Thuế TNCN, GTGT ({exportData.pitRate}%):</strong></div>
                  <div>{formatVND(exportData.pitRate_amount ?? 0)}</div>
                </div>
              ) : null}
              <div className="flex justify-between">
                <div><strong>Tổng cộng sau thuế:</strong></div>
                <div>{formatVND(exportData.grand_total)}</div>
              </div>
            </div>
          </div>
          <div className='px-5'>
            Số chứng từ kèm theo ............................................................................................
          </div>
          <div className="px-5 mt-5">
            <div className="grid grid-cols-4 gap-5 text-center">
              {/* Cột 1: NGƯỜI NHẬN HÀNG */}
              <div className="flex flex-col items-center">
                <div className="font-bold text-sm">NGƯỜI NHẬN HÀNG</div>
                <div className="text-xs">(Ký, họ tên)</div>
              </div>
              
              {/* Cột 2: THỦ KHO */}
              <div className="flex flex-col items-center">
                <div className="font-bold text-sm">THỦ KHO</div>
                <div className="text-xs">(Ký, họ tên)</div>
              </div>

              {/* Cột 3: NGƯỜI LẬP BIỂU */}
              <div className="flex flex-col items-center">
                <div className="font-bold text-sm">NGƯỜI LẬP BIỂU</div>
                <div className="text-xs">(Ký, họ tên)</div>
              </div>

              {/* Cột 4: NGƯỜI ĐẠI DIỆN HỘ, CÁ NHÂN KINH DOANH */}
              <div className="flex flex-col items-center">
                <div className="font-bold text-sm">THỦ TRƯỞNG</div>
                <div className="text-xs">(Ký, họ tên)</div>
              </div>
            </div>
          </div>
          <div>
               <div>
                &nbsp; {/* Space */}
              </div>
              <div>
                &nbsp; {/* Space */}
              </div>
              <div>
                &nbsp; {/* Space */}
              </div>
          </div>
      </div>
    </Modal>
  );
};

export default ExportFileExport;