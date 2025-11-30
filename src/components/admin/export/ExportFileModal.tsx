import { Modal, Button, notification, Tooltip } from 'antd';
import { useRef, useState, useEffect } from 'react'; // Import useEffect


import logoEit from '../../../assets/images/eitLogo.jpg';
import qrcode from '../../../assets/images/qrcode.jpg';
import sign from '../../../assets/images/sign1.jpg';
import { Export } from '@/types/export.type';
import { formatVND, formatDate } from '@/utils/helpers';
import { format } from 'date-fns';
import { usePrepaymentAmount } from '@/hooks/export/usePrepaymentAmount';

interface ExportFileModalProps {
  visible: boolean;
  exportId: number;
  exportData: Export | null;
  onClose: () => void;
}

const ExportFileModal = ({
  visible,
  exportId,
  onClose,
  exportData,
}: ExportFileModalProps) => {
  if (!exportData) {
    return null;
  }


  const { customer, export_date, exportDetails } = exportData;
  const { data: prepaymentData, isLoading: isPrepaymentLoading } = usePrepaymentAmount(exportData.id);
  const shouldBreakBeforeSignature = exportDetails && exportDetails.length > 2;


  const formattedDateHD = format(new Date(exportData.export_date), "ddMMyyyy");

  const memberPoints = Math.floor(exportData.total_amount / 100000);
  const redeemAmount = customer.loyaltyPoint * 1000;

  const modalContentRef = useRef(null);
  const [isPersonal, setIsPersonal] = useState(true);

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
        filename: `Báo_Giá_${customer?.phoneNumber}_${formattedDateHD}_${exportId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,  // Đảm bảo các hình ảnh sắc nét hơn
          useCORS: true, 
          logging: true,
          pageBreak: true, // Kích hoạt phân trang tự động
          allowTaint: true, // Cho phép chụp ảnh từ các nguồn không được phép
          letterRendering: true,
        
        },
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
      title={`Chi tiết Báo Giá #${exportId}`}
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
      <div ref={modalContentRef} className="text-xs">
        {/* Header with Logo and Company Information */}
        <div className="flex justify-between items-center px-5 border-b-2 border-black pb-2">
          {/* Left Section: Logo */}
          <div className="flex-shrink-0 ml-5">
            <img src={logoEit.src} alt="Logo" className="h-18" />
          </div>

          {/* Right Section: Company Info */}
          <div className="text-left ml-5">
            <div style={{ color: "#AB2B32" }}><strong>NHÀ THÔNG MINH EITsmart</strong></div>
            <div style={{ color: "#AB2B32" }}><strong>BẢNG BÁO GIÁ</strong></div>
            <div className='text-sx'>Trung tâm KD: Block B, Số 9 Nguyễn Thị Định, An Phú, Quận 2, TP.HCM</div>
            <div className='text-sx'>VPTC-MB: 49A Đường 2, Mai Đình, Sóc Sơn, Tp. Hà Nội</div>
            <div className='text-sx'>VPTC-MT: 77 Nguyễn Khả Trạc, Hòa Châu, Hòa Vang, TP.Đà Nẵng</div>
            <div className='text-sx'>Https://eitsmart.com.vn - Email: eitsmart.com.vn@gmail.com</div>
            <div className='text-sx'>Hotline: 0788.415.785 - Kinh doanh: 0901.406.730</div>
          </div>
        </div>

        {/* Body with Customer Information */}
        <div className="px-5 mt-2 text-sx">
          <div className='ml-8'>
              <div><strong>Khách hàng:</strong> {customer?.name}</div>
               <div className="flex justify-start w-full gap-4">
                <div className="w-1/2 text-left">
                  <strong>Số SĐT:</strong> {customer?.phoneNumber}
                </div>
                <div className="w-1/2 text-left">
                  <strong>Số báo giá:</strong> {exportData.id}
                </div>
              </div>
              <div><strong>Mã số thuế:</strong> {customer?.mst}</div>
              <div><strong>Địa chỉ giao hàng:</strong> {customer?.address}</div>
              <div><strong>Email nhận hóa đơn:</strong> {customer?.email}</div>
              <div className="flex justify-start w-full gap-4">
                <div className="w-1/2 text-left">
                  <strong>Ngày báo giá:</strong> {formatDate(export_date)}
                </div>
                <div className="w-1/2 text-left">
                  <strong>Hiệu lực báo giá:</strong> 5 ngày
                </div>
              </div>
          </div>
          <div className="text-justify">
            EITsmart xin chân thành cảm ơn sự quan tâm và tin tưởng của Quý khách hàng đến sản phẩm và dịch vụ của Chúng tôi.
            Chúng tôi trân trọng gởi bảng báo giá đến quý khách hàng chi tiết như dưới đây.
          </div>
        </div>

        {/* Table with Export Details */}
        <div className="overflow-x-auto px-5 mt-2 text-sx no-page-break-inside">
          <table className="pdf-table">
            <thead>
              <tr className="border">
                <th className="px-1 py-2 text-center border w-[4%]">Stt</th>
                <th className="px-3 py-2 text-center border w-[54%]">Mô tả hàng hóa</th>
                <th className="px-3 py-2 text-center border w-[8%]">Model</th>
                <th className="px-3 py-2 text-center border w-[10%]">Ghi chú</th>
                <th className="px-3 py-2 text-center border w-[8%]">ĐV</th>
                <th className="px-3 py-2 text-center border w-[5%]">SL</th>
                <th className="px-1 py-2 text-center border w-[12%]">Đơn giá (đ)</th>
                <th className="px-1 py-2 text-center border w-[12%]">Thành tiền (đ)</th>
              </tr>
            </thead>
            <tbody>
              {exportDetails?.map((item, index) => (
                <tr key={item.id} className="border-b">
                  <td className="text-center border">{index + 1}</td>
                  <td className="border description-cell">
                    <div>{item?.product?.title || '-'}</div>
                   <div
                      dangerouslySetInnerHTML={{
                        __html: `<div style="margin: 0; white-space: normal;"><style>p { margin: 0; }</style>${(item?.product?.description || '').replace(/\n/g, '<br />')}</div>`,
                      }}
                    />
                  </td>
                  <td className="text-center border">{item?.product?.sku || '-'}</td>
                  <td className="text-center border">
                    {
                      item?.note ? (item.note) : (item.colorTitle)
                    }
                  </td>
                  <td className="text-center border">{item?.product?.unit || '-'}</td>
                  <td className="text-center border">{item.quantity}</td>
                  <td className="text-right border">
                    <Tooltip
                      title={
                        item.discountPercent && item.discountPercent > 0 ? (
                          <>
                            <div>Giảm giá: {item.discountPercent}%</div>
                            <div>
                              Giá gốc: {item.unitPrice.toLocaleString('vi-VN')} đ
                            </div>
                          </>
                        ) : (
                          "Không có giảm giá"
                        )
                      }
                    >
                      <span>
                        {(
                          item.unitPrice - (item.unitPrice * (item.discountPercent || 0)) / 100
                        ).toLocaleString('vi-VN')}
                      </span>
                    </Tooltip>
                  </td>
                <td className="text-right border">
                  <Tooltip
                    title={
                      <>
                        <div>Giảm giá: {item.discountPercent || 0}%</div>
                        <div>
                          Giá gốc:{" "}
                          {(
                            item.finalPrice / (1 - (item.discountPercent || 0) / 100)
                          ).toLocaleString("vi-VN")}{" "}
                          đ
                        </div>
                      </>
                    }
                  >
                    <span>{item.finalPrice.toLocaleString("vi-VN")}</span>
                  </Tooltip>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

       <div className="mt-2 px-5 flex justify-end text-sx no-page-break-inside">
          <div className="w-full ml-8">
            <div className="flex justify-between">
              <div><strong>Tổng cộng trước thuế:</strong></div>
              <div><strong>{formatVND(exportData.total_amount)}</strong></div>
            </div>
            {exportData.vat && exportData.vat > 0 ? (
              <div className="flex justify-between">
                <div><strong>Thuế VAT ({exportData.vat}%):</strong></div>
                <div><strong>{formatVND(exportData.vat_amount ?? 0)}</strong></div>
              </div>
            ) : exportData.pitRate && exportData.pitRate > 0 ? (
              <div className="flex justify-between">
                <div><strong>Thuế TNCN, GTGT ({exportData.pitRate}%):</strong></div>
                <div><strong>{formatVND(exportData.pitRate_amount ?? 0)}</strong></div>
              </div>
            ) : null}
            <div className="flex justify-between">
              <div><strong>Tổng cộng sau thuế:</strong></div>
              <div><strong>{formatVND(exportData.grand_total)}</strong></div>
            </div>
            <div className="flex justify-between">
              <div><strong>Cộng điểm thành viên EIT:</strong></div>
              <div><strong>{memberPoints}</strong></div>
            </div>
            <div className="flex justify-between">
              <div><strong>Điểm thành viên tích lũy đến hiện tại:</strong></div>
              <div>
                <strong>
                  {exportData?.applyLoyaltyPoint
                    ? exportData.loyaltyPointUsed
                    : customer.loyaltyPoint}
                </strong>
              </div>
            </div>
            <div className="flex justify-between">
              <div><strong>Thành tiền quy đổi điểm tích lũy:</strong></div>
               <div>
                <strong>
                  {exportData?.applyLoyaltyPoint
                    ? formatVND(exportData.loyaltyPointAmount ?? 0)
                    : customer.loyaltyPoint * 1000}
                </strong>
              </div>
            </div>
          </div>
        </div>
        
        <div className='px-5 text-sx no-page-break-inside ml-8'>
          <div>Mỗi điểm thành viên tương đương 1.000 đ</div>
          <div>Điểm thành viên tích lũy được quy đổi thành giá trị giảm giá vào mỗi đơn hàng</div>
          <div>Đơn giá chưa bao gồm phí vận chuyển</div>
          <div>Phí ship do đơn vị vận chuyển thu (ViettelPost/Grab/Bee) khi nhận hàng</div>
          <div>Thời gian giao hàng: 1-3 ngày</div>
          <div>Được xem hàng, kiểm đếm trước khi thanh toán</div>
        </div>

        {/* Payment Terms Section */}
        <div className='px-5 text-sx no-page-break-inside'>
          <div className="font-bold" style={{ color: "#AB2B32" }}>PHƯƠNG THỨC THANH TOÁN</div>
          <div className='ml-8'>
            <strong style={{ color: "#AB2B32" }}>GIAO HỎA TỐC, THEO YÊU CẦU:</strong>
              <div className="list-inside">
                <div className="flex justify-between">
                  <div className="w-7/10 flex justify-between">
                    <span>- Thanh toán 100% trước khi giao hàng</span>
                  </div>
                  <div className="w-3/10 flex justify-between">
                    <span className="text-center">100%</span>
                    <span className="text-center"><strong>{formatVND(exportData.grand_total)}</strong></span>
                  </div>
                </div>
              </div>

              <strong style={{ color: "#AB2B32" }}>GIAO THƯỜNG (Viettle Post):</strong>
              <div className="list-inside">
                <div className="flex justify-between">
                  <div className="w-7/10 flex justify-between">
                    <span>- Thanh toán tạm ứng</span>
                  </div>
                  <div className="w-3/10 flex justify-between">
                    <span className="text-center">
                    {prepaymentData && typeof prepaymentData.amount === 'number' && exportData.grand_total
                      ? `${Math.round((prepaymentData.amount / exportData.grand_total) * 100)}%`
                      : '20%'}
                    </span>
                    <span className="text-center">
                      <strong>
                          {formatVND(
                            prepaymentData && typeof prepaymentData.amount === 'number'
                              ? prepaymentData.amount
                              : exportData.grand_total * 0.2
                          )}
                      </strong>
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="w-7/10 flex justify-between">
                    <span>- Thanh toán khi nhận hàng (COD)</span>
                  </div>
                  <div className="w-3/10 flex justify-between">
                    <span className="text-center">
                      {prepaymentData && typeof prepaymentData.amount === 'number' && exportData.grand_total
                      ? `${Math.round(
                          ((exportData.grand_total - prepaymentData.amount) / exportData.grand_total) * 100
                        )}%`
                      : '80%'}
                    </span>
                    <span className="text-center">
                      <strong>
                         {formatVND(
                            prepaymentData && typeof prepaymentData.amount === 'number'
                              ? exportData.grand_total - prepaymentData.amount
                              : exportData.grand_total * 0.8
                          )}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
              <div><strong>Lưu ý:</strong> Tiết kiệm 50% phí vận chuyển khi thanh toán 100% (không COD)</div>
          </div>
        </div>


        <div className="px-5 text-sx no-page-break-inside">
          <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Toggle Header */}
                  <div
                    className="font-bold cursor-pointer select-none"
                    style={{ color: "#AB2B32" }}
                    onClick={() => setIsPersonal(!isPersonal)}
                  >
                    {isPersonal ? "TÀI KHOẢN CÁ NHÂN" : "TÀI KHOẢN DOANH NGHIỆP"}
                  </div>

                  {/* Personal Account Info */}
                  {isPersonal ? (
                    <div className='ml-8 mt-1'>
                      <div><strong>Ngân hàng: VIETCOMBANK </strong></div>
                      <div><strong>SKT bằng chữ: EITSMART </strong></div>
                      <div><strong>STK bằng số: 0071001240616 </strong></div>
                      <div><strong>Đại diện: VÕ TRUNG LƯƠNG </strong></div>
                       <div>Thời gian bảo hành: 12 tháng</div>
                      <div>
                        Cảm ơn Qúy khách hàng đã hợp tác cùng chúng tôi! <br />
                        Trân trọng!
                      </div>
                    </div>
                  ) : (
                    <div className='ml-8 mt-1'>
                      <div><strong>Ngân hàng: HDBANK </strong></div>
                      <div><strong>Chủ tài khoản: CÔNG TY TNHH GIẢI PHÁP KỸ THUẬT EIT </strong></div>
                      <div><strong>STK: 1687.040700.25388 </strong></div>
                      <div><strong>Chi nhánh: HDBANK – Nguyễn Đình Chiểu </strong></div>
                      <div>Thời gian bảo hành: 12 tháng</div>
                      <div>
                        Cảm ơn Qúy khách hàng đã hợp tác cùng chúng tôi! <br />
                        Trân trọng!
                      </div>
                    </div>
                  )}
                </div>

                {
                  isPersonal ?  <div className="ml-5 mr-10 mt-5 flex-shrink-0">
                  <img src={qrcode.src} alt="QR Code" className="h-40" />
                </div> : null
                }
               
              </div>
        </div>
        <div className="flex justify-between no-page-break-inside">
            <div className="flex-1 text-center">
              <div className="font-bold text-small">XÁC NHẬN ĐẶT HÀNG</div>
            </div>
            <div className="flex-1 text-center">
              <div className="font-bold text-small">GIÁM ĐỐC</div>
              <div className="flex justify-center">
                <img src={sign.src} alt="Signature" className="h-40 mt-2" />
              </div>
            </div>
        </div>
      </div>

      
    </Modal>
  );
};

export default ExportFileModal;

