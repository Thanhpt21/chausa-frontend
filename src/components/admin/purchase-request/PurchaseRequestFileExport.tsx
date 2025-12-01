import { Modal, Button, notification } from 'antd';
import { useRef, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { formatVND } from '@/utils/helpers';

interface PurchaseRequestFileExportProps {
  visible: boolean;
  purchaseRequestId: number;
  purchaseRequestData: any | null; // bạn nên thay bằng type tương ứng
  onClose: () => void;
}

const PurchaseRequestFileExport = ({
  visible,
  purchaseRequestId,
  purchaseRequestData,
  onClose,
}: PurchaseRequestFileExportProps) => {
  if (!purchaseRequestData) return null;

  const {
    purchase_date,
    details,
    total_amount,
    supplier,
    note,
  } = purchaseRequestData;

  const formattedDate = format(new Date(purchase_date), "'Ngày' dd 'tháng' MM 'năm' yyyy");
  const formattedDateShort = format(new Date(purchase_date), "ddMMyyyy");

  const modalContentRef = useRef<HTMLDivElement | null>(null);

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
        filename: `De_nghi_${formattedDateShort}_${purchaseRequestId}.pdf`,
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
      title={`Phiếu đề nghị nhập vật tư #${purchaseRequestId}`}
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
      <div ref={modalContentRef} className="p-5 text-xs">
        <div className="mb-4">
          <strong>CHÂU SA</strong><br />
        </div>

        <div className="text-center mt-5">
          <div className="text-base font-bold">GIẤY ĐỀ NGHỊ NHẬP VẬT TƯ HÀNG HÓA</div>
          <div><i>{formattedDate}</i></div>
          <div>Số: DN_{purchaseRequestId}/{formattedDateShort}</div>
        </div>

        <div className="mb-4">
        <div><strong>Nhà phân phối:</strong> {supplier?.name || ''}</div>
        <div><strong>Email:</strong> {supplier?.email || ''}</div>
        <div><strong>Số điện thoại:</strong> {supplier?.phoneNumber || ''}</div>
        <div><strong>Địa chỉ:</strong> {supplier?.address || ''}</div>
        <div><strong>Mã số thuế:</strong> {supplier?.mst || ''}</div>
        <div><strong>Lý do nhập vật tư, hàng hóa:</strong> ..............................................................................</div>
        </div>

        <div>
           <div><strong>Ghi chú:</strong> {purchaseRequestData.note || ''}</div>
            <div><strong>Người tạo phiếu:</strong> {purchaseRequestData.user?.name || '-'}</div>
        </div>

        <table className="pdf-table">
          <thead>
            <tr style={{ borderBottom: '1px solid black' }}>
              <th className="border px-2 py-1 text-center w-[4%]">Stt</th>
              <th className="border px-2 py-1 text-center w-[54%]">Tên sản phẩm</th>
              <th className="border px-2 py-1 text-center w-[8%]">Mã sản phẩm</th>
              <th className="border px-2 py-1 text-center w-[10%]">Ghi chú</th>
              <th className="border px-2 py-1 text-center w-[8%]">Số lượng</th>
              <th className="border px-2 py-1 text-center w-[5%]">Đơn vị</th>
              <th className="border px-2 py-1 text-center w-[12%]">Đơn giá</th>
              <th className="border px-2 py-1 text-center w-[12%]">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {details?.map((item: any, idx: number) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td className="border px-2 py-1 text-center">{idx + 1}</td>
                  <td className="px-2 py-1 border description-cell">
                    <div>{item?.product?.title || '-'}</div>
                   <div
                      dangerouslySetInnerHTML={{
                        __html: `<div style="margin: 0; white-space: normal;"><style>p { margin: 0; }</style>${(item?.product?.description || '').replace(/\n/g, '<br />')}</div>`,
                      }}
                    />
                  </td>
                <td className="border px-2 py-1 text-center">{item.product?.sku || '-'}</td>
                <td className="border px-2 py-1 text-center">{item.colorTitle || '-'}</td>
                <td className="border px-2 py-1 text-center">{item.quantity}</td>
                <td className="border px-2 py-1 text-center">{item.product?.unit || '-'}</td>
                <td className="border px-2 py-1"></td>
                <td className="border px-2 py-1"></td>
              </tr>
            ))}
          </tbody>
        </table>


        <div className="mt-8 grid grid-cols-4 gap-5 text-center text-sm">
          <div>
            <div className="font-bold">BGH duyệt đề nghị</div>
            <div>(Ký, họ tên)</div>
          </div>
          <div>
            <div className="font-bold">Kế toán trưởng</div>
            <div>(Ký, họ tên)</div>
          </div>
          <div>
            <div className="font-bold">Phụ trách bộ phận</div>
            <div>(Ký, họ tên)</div>
          </div>
          <div>
            <div className="font-bold">Người đề nghị</div>
            <div>(Ký, họ tên)</div>
          </div>
        </div>

        <div style={{ height: 60 }} /> {/* Khoảng trống cho chữ ký */}
      </div>
    </Modal>
  );
};

export default PurchaseRequestFileExport;
