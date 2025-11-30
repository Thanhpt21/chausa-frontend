import { Modal, Button, notification } from 'antd';
import { useRef, useState, useEffect, Fragment } from 'react'; // Import useEffect


  import {
    UpOutlined,
    DownOutlined,
  } from '@ant-design/icons';
import logoEit from '../../../assets/images/eitLogo.jpg';
import qrcode from '../../../assets/images/qrcode.jpg';
import sign from '../../../assets/images/sign1.jpg';
import { Export } from '@/types/export.type';
import { formatVND, formatDate } from '@/utils/helpers';
import { format } from 'date-fns';
import { usePrepaymentAmount } from '@/hooks/export/usePrepaymentAmount';
import { useUpdateProjectCategoryOrder } from '@/hooks/export-detail/useUpdateProjectCategoryOrder';
import { useQueryClient } from '@tanstack/react-query';
import { useExportDetailsByExportId } from '@/hooks/export-detail/useExportDetailsByExportId';

interface ExportFileProjectModalProps {
  visible: boolean;
  exportId: number;
  exportData: Export | null;
  onClose: () => void;
}

const ExportFileProjectModal = ({
  visible,
  exportId,
  onClose,
  exportData,
}: ExportFileProjectModalProps) => {
  if (!exportData) {
    return null;
  }

   const queryClient = useQueryClient();


  const { customer, export_date } = exportData;
  const { data: exportDetails, isLoading: isExportDetailsLoading, refetch } = useExportDetailsByExportId(exportId);

  const { data: prepaymentData, isLoading: isPrepaymentLoading } = usePrepaymentAmount(exportData.id);
  const { mutateAsync: updateCategoryOrder, isError, data } = useUpdateProjectCategoryOrder();
  const [isEditingSecondPayment, setIsEditingSecondPayment] = useState(false);
  const [secondPaymentPercent, setSecondPaymentPercent] = useState<number>(40);
  const advancePercent = exportData.advancePercent ?? 20;
  const thirdPaymentPercent = 100 - advancePercent - secondPaymentPercent;

  useEffect(() => {
  if(prepaymentData) {
  }
}, [prepaymentData]);

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

  const alphabet = [...Array(26)].map((_, i) => String.fromCharCode(65 + i));

  const groupedCategories = exportDetails
  ? Object.entries(
      exportDetails.reduce((acc, item) => {
        const category = item.projectCategoryTitle || 'Không phân loại';
        const order = item.projectCategoryOrder ?? 9999;

        if (!acc[category]) {
          acc[category] = {
            items: [],
            order,
            projectCategoryId: item.projectCategoryId,
          };
        }

        acc[category].items.push(item);
        return acc;
      }, {} as Record<
        string,
        {
          items: typeof exportDetails;
          order: number;
          projectCategoryId: number | null;
        }
      >)
    )
  : [];

// Sắp xếp nhóm theo order
  const sortedGroups = groupedCategories.sort(([, a], [, b]) => a.order - b.order);

  const handleChangeOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sortedGroups.length) {
      // Không đổi nếu ra ngoài phạm vi
      return;
    }

    const currentGroup = sortedGroups[index][1];
    const targetGroup = sortedGroups[targetIndex][1];


    // Hoán đổi order của 2 nhóm
    try {
      // Cập nhật nhóm hiện tại với order mới của nhóm kia
      await updateCategoryOrder({
        exportId,
        projectCategoryId: currentGroup.projectCategoryId,
        projectCategoryOrder: targetGroup.order,
      });

      // Cập nhật nhóm target với order mới của nhóm hiện tại
      await updateCategoryOrder({
        exportId,
        projectCategoryId: targetGroup.projectCategoryId,
        projectCategoryOrder: currentGroup.order,
      });

      refetch();

      // TODO: sau khi cập nhật thành công, bạn nên refetch data hoặc cập nhật local state để UI cập nhật
    } catch (error) {
      notification.error({
        message: 'Lỗi cập nhật thứ tự',
        description: 'Không thể thay đổi thứ tự danh mục. Vui lòng thử lại.',
      });
    }
  };

  return (
    <Modal
      visible={visible}
      title={`Chi tiết báo giá thi công #${exportId}`}
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
      <div ref={modalContentRef} className='text-sx'>
        {/* Header with Logo and Company Information */}
        <div className="flex justify-between items-center px-5 border-b-2 border-black pb-2">
          {/* Left Section: Logo */}
          <div className="flex-shrink-0 ml-5">
            <img src={logoEit.src} alt="Logo" className="h-18" />
          </div>

          {/* Right Section: Company Info */}
          <div className="text-left ml-5">
            <div style={{ color: "#AB2B32" }}><strong>NHÀ THÔNG MINH EITsmart</strong></div>
            <div style={{ color: "#AB2B32" }}><strong>BẢNG BÁO GIÁ THI CÔNG, LẮP ĐẶT</strong></div>
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
                  <strong>Số báo giá thi công:</strong> {exportData.id}
                </div>
              </div>
              <div><strong>Mã số thuế:</strong> {customer?.mst}</div>
              <div><strong>Địa chỉ lắp đặt:</strong> {customer?.address}</div>
              <div className="flex justify-start w-full gap-4">
                <div className="w-1/2 text-left">
                  <strong>Ngày báo giá thi công:</strong> {formatDate(export_date)}
                </div>
                <div className="w-1/2 text-left">
                  <strong>Hiệu lực báo giá thi công:</strong> 5 ngày
                </div>
              </div>
          </div>
          <div className="text-justify">
            EITsmart xin chân thành cảm ơn sự quan tâm và tin tưởng của Quý khách hàng đến sản phẩm và dịch vụ của Chúng tôi.
            Chúng tôi trân trọng gởi bảng báo giá thi công đến quý khách hàng chi tiết như dưới đây.
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
                {groupedCategories.map(([category, group], groupIndex) => {
                    const subtotal = group.items?.reduce((sum, item) => sum + item.finalPrice, 0);
                    const letter = alphabet[groupIndex] || '?';

                    return (
                      <Fragment key={groupIndex}>
                        {/* Row: Danh mục */}
                        {groupedCategories.length > 1 && (
                        <tr>
                          <td colSpan={8} className="px-3 py-2 font-bold border bg-gray-100 text-left">
                            <div className="flex justify-between items-center group">
                              <div className="flex items-center gap-1">
                                <span>{letter}. {category}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                                  <UpOutlined className="text-xs text-gray-600 hover:text-black" onClick={() => handleChangeOrder(groupIndex, 'up')} />
                                  <DownOutlined className="text-xs text-gray-600 hover:text-black" onClick={() => handleChangeOrder(groupIndex, 'down')} />
                                </div>
                              </div>
                              <span>{subtotal?.toLocaleString('vi-VN')}</span>
                            </div>
                          </td>
                        </tr>
                        )}

                        {/* Rows: Sản phẩm trong danh mục */}
                        {group?.items?.map((item, index) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-1 py-2 text-center border">{index + 1}</td>
                            <td className="px-3 py-2 border description-cell">
                              <div>{item?.product?.title || '-'}</div>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: `<div style="margin: 0; white-space: normal;"><style>p { margin: 0; }</style>${(item?.product?.description || '').replace(/\n/g, '<br />')}</div>`,
                                }}
                              />
                            </td>
                            <td className="px-3 py-2 text-center border">{item?.product?.sku || '-'}</td>
                            <td className="px-3 py-2 text-center border">{item.colorTitle || '-'}</td>
                            <td className="px-3 py-2 text-center border">{item?.product?.unit || '-'}</td>
                            <td className="px-3 py-2 text-center border">{item.quantity}</td>
                            <td className="px-1 py-2 text-right border">
                              {((item.unitPrice) - (item.unitPrice * item.discountPercent) / 100).toLocaleString('vi-VN')}
                            </td>
                            <td className="px-1 py-2 text-right border">
                              {item.finalPrice.toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    );
                  })}
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
          
          </div>
        </div>
        
        <div className='px-5 text-sx no-page-break-inside ml-8 italic'>
          <div>Thanh toán theo thực tế nghiệm thu lắp đặt</div>
        </div>

        {/* Payment Terms Section */}
        <div className='px-5 text-sx no-page-break-inside'>
          <div className="font-bold" style={{ color: "#AB2B32" }}>PHƯƠNG THỨC THANH TOÁN</div>
          <div className='ml-8'>
              <div className="list-inside">
                  {exportData.isProject && (
                  <>
                    {/** Đợt 1: Tạm ứng */}
                    <div className="flex justify-between">
                      <div className="w-7/10 flex justify-between">
                        <span>- Thanh toán tạm ứng</span>
                      </div>
                      <div className="w-3/10 flex justify-between">
                        <span className="text-center">
                          {exportData.advancePercent ?? 20}%
                        </span>
                        <span className="text-center">
                          <strong>
                            {formatVND(
                              exportData.grand_total * ((exportData.advancePercent ?? 20) / 100)
                            )}
                          </strong>
                        </span>
                      </div>
                    </div>

                   {/* Đợt 2: Click để chỉnh sửa */}
                      <div className="flex justify-between items-center">
                        <div className="w-7/10 flex justify-between">
                          <span>- Thanh toán đợt 2 (Sau khi vật tư thiết bị đến công trình sẵn sàng lắp đặt)</span>
                        </div>
                        <div className="w-3/10 flex justify-between">
                          {isEditingSecondPayment ? (
                            <input
                              type="number"
                              autoFocus
                              className="w-16 text-center border rounded"
                              value={secondPaymentPercent}
                              min={0}
                              max={100 - advancePercent}
                              onChange={(e) => {
                                let value = parseInt(e.target.value);
                                if (isNaN(value)) value = 0;
                                if (value < 0) value = 0;
                                if (value > 100 - advancePercent) value = 100 - advancePercent;
                                setSecondPaymentPercent(value);
                              }}
                              onBlur={() => {
                                setIsEditingSecondPayment(false);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  (e.target as HTMLInputElement).blur(); // enter = blur
                                }
                              }}
                            />
                          ) : (
                            <span
                              className="text-center cursor-pointer"
                              onDoubleClick={() => setIsEditingSecondPayment(true)}
                            >
                              {secondPaymentPercent}%
                            </span>
                          )}
                          <span className="text-center">
                            <strong>
                              {formatVND(exportData.grand_total * (secondPaymentPercent / 100))}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Đợt 3: Tự động tính phần còn lại */}
                      <div className="flex justify-between">
                        <div className="w-7/10 flex justify-between">
                          <span>- Thanh toán đợt 3 (Sau khi hoàn thành bàn giao sử dụng)</span>
                        </div>
                        <div className="w-3/10 flex justify-between">
                          <span className="text-center">{thirdPaymentPercent}%</span>
                          <span className="text-center">
                            <strong>
                              {formatVND(exportData.grand_total * (thirdPaymentPercent / 100))}
                            </strong>
                          </span>
                        </div>
                      </div>
                  </>
                  )}
                </div>
          </div>
        </div>

        {/* Shipping Methods Section */}
        <div className='px-5 text-sx no-page-break-inside'>
          <div className="font-bold" style={{ color: "#AB2B32" }}>THỜI GIAN, TIẾN ĐỘ THI CÔNG</div>
          <div className="list-inside ml-8">
            <div>- Thời gian bắt đầu thi công kể từ ngày nhận được tạm ứng (Ngày):</div>
            <div>- Tiến độ thi công (Ngày):</div>
          </div>
        </div>

        {/* Footer Section */}
        <div className='px-5 text-sx no-page-break-inside'>
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
                       <div>Thời gian bảo hành: 24 tháng</div>
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
                      <div>Thời gian bảo hành: 24 tháng</div>
                      <div>
                        Cảm ơn Qúy khách hàng đã hợp tác cùng chúng tôi! <br />
                        Trân trọng!
                      </div>
                    </div>
                  )}
                </div>

                {/* QR Code */}
                {
                  isPersonal ?  <div className="ml-5 mr-10 mt-5 flex-shrink-0">
                  <img src={qrcode.src} alt="QR Code" className="h-40" />
                </div> : null
                }
               
              </div>


          <div className="flex justify-between">
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
      </div>
    </Modal>
  );
};

export default ExportFileProjectModal;

