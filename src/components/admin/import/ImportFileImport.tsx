import { Modal, Button, notification } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { formatVND } from '@/utils/helpers';
import { Import } from '@/types/import.type';

interface ImportFileImportProps {
  visible: boolean;
  importId: number;
  importData: Import | null;
  onClose: () => void;
}

const ImportFileImport = ({
  visible,
  importId,
  importData,
  onClose,
}: ImportFileImportProps) => {
  const modalContentRef = useRef(null);
  const [html2pdf, setHtml2pdf] = useState<any>(null);

   const importDetails = importData?.importDetails || [];
   const supplier = importData?.supplier;

  useEffect(() => {
    import('html2pdf.js')
      .then((module) => setHtml2pdf(() => module.default))
      .catch(() => {
        notification.error({
          message: 'Lỗi tải thư viện',
          description: 'Không thể tải thư viện xuất PDF.',
        });
      });
  }, []);

  if (!importData) return null;

  const formattedDate = format(new Date(importData.import_date), "'Ngày' dd 'tháng' MM 'năm' yyyy");
  const formattedDateHD = format(new Date(importData.import_date), "ddMMyyyy");

  const handleExportToPDF = () => {
    if (modalContentRef.current && html2pdf) {
      const options = {
        margin: 10,
        filename: `Nhap_kho_${formattedDateHD}_${importId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      html2pdf().from(modalContentRef.current).set(options).save();
    }
  };

  console.log("supplier", supplier)

  return (
    <Modal
      visible={visible}
      title={`Phiếu nhập kho #${importId}`}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>Đóng</Button>,
        <Button key="pdf" type="primary" onClick={handleExportToPDF} disabled={!html2pdf}>
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
            <div><strong>Địa chỉ:</strong> 37 Nguyễn Văn Huyên, Phú Thọ Hoà, TP.HCM</div>
            <div><strong>Website:</strong> www.eitsmart.com.vn</div>
          </div>
        </div>

        <div className="text-center mt-5">
          <div className="text-base font-bold">PHIẾU NHẬP KHO</div>
          <div><i>{formattedDate}</i></div>
          <div>Số: NK_{importId}</div>
        </div>

         <div className='px-5'>
            <div><strong>Nhà cung cấp:</strong>  {supplier?.name}</div>
            <div><strong>Số điện thoại:</strong>  {supplier?.phoneNumber}</div>
            <div><strong>Mã số thuế:</strong>  {supplier?.mst}</div>
            <div><strong>Địa chỉ:</strong>  {supplier?.address}</div>
              <div><strong>Ghi chú:</strong> {importData.note || ''}</div>
            <div><strong>Người tạo phiếu:</strong> {importData.user?.name || '-'}</div>
          </div>

        <div className="overflow-x-auto px-5 mt-4 text-xs">
          <table className="pdf-table">
            <thead>
              <tr className="border">
                <th className="px-2 py-2 border w-[4%]">STT</th>
                <th className="px-3 py-2 border w-[54%]">Mô tả hàng hóa</th>
                <th className="px-3 py-2 border w-[8%]">Model</th>
                <th className="px-3 py-2 border w-[10%]">Ghi chú</th>
                <th className="px-2 py-2 border w-[8%]">ĐV</th>
                <th className="px-2 py-2 border w-[5%]">SL</th>
                <th className="px-2 py-2 border w-[12%]">Đơn giá (đ)</th>
                <th className="px-2 py-2 border w-[12%]">Thành tiền (đ)</th>
              </tr>
            </thead>
            <tbody>
              {importDetails.map((item, index) => (
                <tr key={item.id} className="border-b">
                  <td className="px-2 py-2 border">{index + 1}</td>
                  <td className="px-3 py-2 border description-cell">
                    <div>{item?.product?.title || '-'}</div>
                   <div
                      dangerouslySetInnerHTML={{
                        __html: `<div style="margin: 0; white-space: normal;"><style>p { margin: 0; }</style>${(item?.product?.description || '').replace(/\n/g, '<br />')}</div>`,
                      }}
                    />
                  </td>
                  <td className="px-3 py-2 border">{item?.product?.sku || '-'}</td>
                  <td className="px-3 py-2 border">{item?.colorTitle || '-'}</td>
                  <td className="px-2 py-2 border">{item?.product?.unit || '-'}</td>
                  <td className="px-2 py-2 border">{item.quantity}</td>
                  <td className="px-2 py-2 border">
                    {formatVND(item.unitPrice)}
                  </td>
                  <td className="px-2 py-2 border">{formatVND(item.unitPrice * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* <div className="px-5 mt-4 text-right">
          <div><strong>Tổng cộng:</strong> {formatVND(importData.grand_total)}</div>
        </div> */}

        <div className="px-5 mt-5 grid grid-cols-2 gap-5 text-center">
          <div>
            <div className="font-bold text-sm">NGƯỜI LẬP ĐƠN</div>
            <div className="text-xs">(Ký, họ tên)</div>
          </div>
          <div>
            <div className="font-bold text-sm">THỦ TRƯỞNG</div>
            <div className="text-xs">(Ký, họ tên)</div>
          </div>
        </div>

        <div className="h-10">&nbsp;</div>
      </div>
    </Modal>
  );
};

export default ImportFileImport;
