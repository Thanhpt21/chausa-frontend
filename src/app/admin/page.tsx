'use client';

import { useState, useEffect } from 'react'; // Import useEffect for hydration fix
import { Card, Row, Col, DatePicker, Spin } from 'antd'; // Import Spin for loading states
import { useAllCustomers } from '@/hooks/customer/useAllCustomers';
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { useImportStats } from '@/hooks/import/useImportStats';
import { useExportStats } from '@/hooks/export/useExportStats';

import { useTotalRevenue } from '@/hooks/export/useTotalRevenue'; // import hook tổng doanh thu
import { useTotalImportValue } from '@/hooks/import/useTotalImportValue'; // import hook tổng chi phí phát sinh
import { useTotalPrepaymentSum } from '@/hooks/prepayment/useTotalPrepaymentSum';
import RevenueChart from '@/components/common/RevenueChart';
import { ChartData, ChartOptions } from 'chart.js';
import ImportStatusChart from '@/components/common/ImportStatusChart';
import ExportStatusChart from '@/components/common/ExportStatusChart';
import PieChartComponent from '@/components/common/PieChartComponent';
import { useTransferStats } from '@/hooks/transfer/useTransferStats';
import { useTotalRevenueForTransfer } from '@/hooks/transfer/useTotalRevenueForTransfer';
import {
  DollarCircleOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  FileDoneOutlined,
  FileSyncOutlined,
  FileExclamationOutlined,
  FileProtectOutlined,
  UserOutlined,
  InboxOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePurchaseRequestStats } from '@/hooks/purchase/usePurchaseRequestStats';
import { useTotalExtraCostInternal } from '@/hooks/import/useTotalExtraCostInternal';

const { RangePicker } = DatePicker;

export default function AdminPage() {
  const { data: customers, isLoading: loadingCustomers } = useAllCustomers({});
  const { data: products, isLoading: loadingProducts } = useAllProducts({});
  const { data: importStats, isLoading: loadingImportStats } = useImportStats();
  const { data: exportStats, isLoading: loadingExportStats } = useExportStats();
  const { data: transferStats, isLoading: loadingTransferStats } = useTransferStats();
  const { data: purchaseRequestStats, isLoading: loadingPurchaseRequestStats } = usePurchaseRequestStats();

  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const { data: totalRevenueData, isLoading: loadingTotalRevenue } = useTotalRevenue({ startDate, endDate });
  const { data: totalImportValueData, isLoading: loadingTotalImportValue } = useTotalImportValue({ startDate, endDate });
  const { data: totalPrepaymentSumData, isLoading: loadingTotalPrepaymentSum } = useTotalPrepaymentSum({ startDate, endDate });
  const { data: totalRevenueForTransferData, isLoading: loadingTotalRevenueForTransfer } = useTotalRevenueForTransfer({ startDate, endDate });
  const { data: totalExtraCostData, isLoading: loadingTotalExtraCost } = useTotalExtraCostInternal({ startDate, endDate });

const start = startDate
  ? dayjs(startDate).format('DD/MM/YYYY')
  : dayjs().startOf('month').format('DD/MM/YYYY');

const end = endDate
  ? dayjs(endDate).format('DD/MM/YYYY')
  : dayjs().endOf('month').format('DD/MM/YYYY');

  // Hydration fix: State to check if component is mounted on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading =
    loadingCustomers ||
    loadingProducts ||
    loadingImportStats ||
    loadingExportStats ||
    loadingTransferStats ||
    loadingTotalRevenue ||
    loadingTotalImportValue ||
    loadingTotalRevenueForTransfer ||
    loadingTotalPrepaymentSum ||
    loadingPurchaseRequestStats ||
    loadingTotalExtraCost

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    setStartDate(dateStrings[0]);
    setEndDate(dateStrings[1]);
  };

  // Helper to format currency
  const formatCurrency = (amount: number | undefined | null) => {
    return (amount ?? 0).toLocaleString('vi-VN') + ' đ';
  };

  // Helper to render content or a spinner during loading/hydration
  const renderValue = (value: number | undefined | null, isCurrency: boolean = true) => {
    if (!mounted || isLoading) {
      return <Spin size="small" />;
    }
    return isCurrency ? formatCurrency(value) : (value ?? 0);
  };

 const remainingRevenue = totalRevenueData?.totalRevenueExported === 0
  ? totalRevenueData?.totalRevenueExported
  : (totalRevenueData?.totalRevenueExported ?? 0) - (totalPrepaymentSumData?.totalAmount ?? 0);


  const  totalRevenueAll = (totalRevenueData?.totalRevenue ?? 0) + (totalRevenueData?.totalAdditionalCost ?? 0) - (totalRevenueData?.totalExtraCost ?? 0);

    const revenueChartData: ChartData<'bar'> = {
    labels: ['Tổng doanh thu', 'Chi phí nhập kho', 'Đã nhận', 'Chưa nhận'],
    datasets: [
      {
        label: 'VNĐ',
        data: [
          totalRevenueAll ?? 0,
          totalImportValueData?.totalImportValue ?? 0,
          totalPrepaymentSumData?.totalAmount ?? 0,
          remainingRevenue ?? 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
      },
    ],
  };

  const revenueChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tổng quan doanh thu & chi phí',
      },
    },
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Trang Quản Trị</h1>

      {/* Dòng 1: Chọn khoảng thời gian */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={12} lg={6}>
          {mounted ? ( // Render RangePicker only on client
            <RangePicker
              onChange={handleDateChange}
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />
          ) : (
            <div style={{ height: 32, backgroundColor: '#f0f0f0', borderRadius: 6 }}></div> // Placeholder for SSR
          )}
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={24} md={24} lg={24}>
          <Card
            title={
              <span>
                <DollarCircleOutlined className="mr-2 text-green-600" />
                Doanh thu chung từ {start} đến {end}
              </span>
            }
            bordered={false}
          >
            <p className="text-xl font-semibold text-green-700">
              {renderValue(
                (totalRevenueData?.totalRevenue ?? 0) +
                (totalRevenueForTransferData?.totalRevenue ?? 0) -
                (totalExtraCostData?.totalExtraCost ?? 0) + (totalRevenueData?.totalAdditionalCost ?? 0) - (totalRevenueData?.totalExtraCost ?? 0)
              )}
            </p>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="mb-6">
        {/* Tổng doanh thu */}
        <Col xs={24} sm={24} md={12} lg={8}>
          <Card
            title={
              <span>
                <DollarCircleOutlined className="mr-2 text-purple-600" />
                Tổng doanh thu đơn hàng
              </span>
            }
            bordered={false}
          >
            <p className="text-lg font-semibold text-purple-600 mb-2">
              Tổng doanh thu tất cả: {renderValue(totalRevenueData?.totalRevenue)}
            </p>
            <p className="text-sm text-blue-600 mb-2">
              Phí cộng thêm: {renderValue(totalRevenueData?.totalAdditionalCost)}
            </p>
            <p className="text-sm text-green-600 mb-4">
              Phí phát sinh: {renderValue(totalRevenueData?.totalExtraCost)}
            </p>

            <h3 className="text-base font-semibold text-green-700 mb-2 mt-4">
              <FileProtectOutlined className="mr-1" />
              Đơn hàng "Hoàn thành"
            </h3>
            <p className="text-sm">Doanh thu: {renderValue(totalRevenueData?.totalRevenueCompleted)}</p>

            <h3 className="text-base font-semibold text-cyan-700 mb-2 mt-4">
              <FileSyncOutlined className="mr-1" />
              Đơn hàng "Đã xuất kho"
            </h3>
            <p className="text-sm">Dự kiến sẽ nhận: {renderValue(totalRevenueData?.totalRevenueExported)}</p>
            <p className="text-sm">Đã nhận thực tế: {renderValue(totalPrepaymentSumData?.totalAmount)}</p>
            <p className="text-sm">Còn lại chưa nhận: {renderValue(remainingRevenue)}</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8}>
          <Card
            title={
              <span>
                <ShoppingCartOutlined className="mr-2 text-red-600" />
                 Tổng chi phí phát sinh nhập kho
              </span>
            }
            bordered={false}
          >
            <p className="text-lg font-semibold text-purple-600 mb-2">
              Tổng chi phí tất cả: {renderValue(totalExtraCostData?.totalExtraCost)}
            </p>
          </Card>
        </Col>

        {/* Chi phí nhập kho */}
        {/* <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            title={
              <span>
                <ArrowDownOutlined className="mr-2 text-orange-500" />
                Tổng chi phí nhập kho
              </span>
            }
            bordered={false}
          >
            <p className="text-3xl font-semibold text-gray-600">
              {renderValue(totalImportValueData?.totalImportValue)}
            </p>
          </Card>
        </Col> */}

        {/* Doanh thu phiếu xuất */}
        <Col xs={24} sm={24} md={12} lg={8}>
          <Card
            title={
              <span>
                <ArrowUpOutlined className="mr-2 text-gray-600" />
                Tổng chi phí xuất kho
              </span>
            }
            bordered={false}
          >
            <p className="text-lg font-semibold text-purple-600 mb-2">
              Tổng chi phí tất cả: {renderValue(totalRevenueForTransferData?.totalRevenue)}
            </p>
             <h3 className="text-base font-semibold text-green-700 mb-2 mt-4">
              <FileProtectOutlined className="mr-1" />
              "Đã Hoàn thành"
            </h3>
            <p className="text-sm">Chi phí: {renderValue(totalRevenueForTransferData?.totalRevenueCompleted)}</p>

            <h3 className="text-base font-semibold text-cyan-700 mb-2 mt-4">
              <FileSyncOutlined className="mr-1" />
              "Đã xuất kho"
            </h3>
            <p className="text-sm">Chi phí: {renderValue(totalRevenueForTransferData?.totalRevenueExported)}</p>

           
          </Card>
        </Col>
      </Row>

      {/* THỐNG KÊ PHIẾU VÀ ĐỐI TƯỢNG */}
      <Row gutter={[16, 16]} className="mb-6">
      

        {/* Phiếu nhập */}
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card title={<span><InboxOutlined className="mr-2" />Phiếu nhập kho</span>} bordered={false}>
            {mounted && !isLoading ? (
              <>
                <p className="text-3xl font-semibold text-orange-500">{importStats?.total ?? 0}</p>
                <p className="text-sm">Chờ xử lý: {importStats?.pending ?? 0}</p>
                <p className="text-sm">Đã nhập kho: {importStats?.completed ?? 0}</p>
                <p className="text-sm">Đã huỷ: {importStats?.cancelled ?? 0}</p>
              </>
            ) : (
              <Spin size="small" />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <Card title={<span><FileDoneOutlined className="mr-2" />Phiếu đề nghị mua hàng</span>} bordered={false}>
            {mounted && !isLoading ? (
              <>
                <p className="text-3xl font-semibold text-blue-600">{purchaseRequestStats?.total ?? 0}</p>
                <p className="text-sm">Chờ xử lý: {purchaseRequestStats?.pending ?? 0}</p>
                <p className="text-sm">Hoàn thành: {purchaseRequestStats?.completed ?? 0}</p>
                <p className="text-sm">Đã huỷ: {purchaseRequestStats?.cancelled ?? 0}</p>
              </>
            ) : (
              <Spin size="small" />
            )}
          </Card>
        </Col>

        {/* Phiếu xuất đơn hàng */}
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card title={<span><FileDoneOutlined className="mr-2" />Phiếu xuất đơn hàng</span>} bordered={false}>
            {mounted && !isLoading ? (
              <>
                <p className="text-3xl font-semibold text-red-500">{exportStats?.total ?? 0}</p>
                <p className="text-sm">Chờ xử lý: {exportStats?.pending ?? 0}</p>
                <p className="text-sm">Đã xuất kho: {exportStats?.exporting ?? 0}</p>
                <p className="text-sm">Đã huỷ: {exportStats?.cancelled ?? 0}</p>
                <p className="text-sm">Từ chối: {exportStats?.rejected ?? 0}</p>
                <p className="text-sm">Hoàn thành: {exportStats?.completed ?? 0}</p>
              </>
            ) : (
              <Spin size="small" />
            )}
          </Card>
        </Col>

        {/* Phiếu xuất kho */}
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card title={<span><FileTextOutlined className="mr-2" />Phiếu xuất kho</span>} bordered={false}>
            {mounted && !isLoading ? (
              <>
                <p className="text-3xl font-semibold text-red-500">{transferStats?.total ?? 0}</p>
                <p className="text-sm">Chờ xử lý: {transferStats?.pending ?? 0}</p>
                <p className="text-sm">Đã xuất kho: {transferStats?.exported ?? 0}</p>
                <p className="text-sm">Đã huỷ: {transferStats?.cancelled ?? 0}</p>
                <p className="text-sm">Hoàn thành: {transferStats?.completed ?? 0}</p>
              </>
            ) : (
              <Spin size="small" />
            )}
          </Card>
        </Col>


      </Row>

      <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} md={12}>
          <Card title="Biểu đồ tổng quan" bordered={false}>
            {mounted && !isLoading ? (
              <RevenueChart data={revenueChartData} options={revenueChartOptions} />
            ) : (
              <Spin />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card title="Khách hàng & Sản phẩm" bordered={false}>
            {mounted && !isLoading ? (
              <PieChartComponent
                title="Tỉ lệ Khách hàng & Sản phẩm"
                labels={['Khách hàng', 'Sản phẩm']}
                data={[customers?.length ?? 0, products?.length ?? 0]}
                colors={['#1890ff', '#52c41a']}
              />
            ) : (
              <Spin size="small" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Biểu đồ nhập kho" bordered={false}>
            {mounted && !isLoading && importStats ? (
              <ImportStatusChart stats={importStats} />
            ) : (
              <Spin />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Biểu đồ xuất kho" bordered={false}>
            {mounted && !isLoading && exportStats ? (
              <ExportStatusChart stats={exportStats} />
            ) : (
              <Spin />
            )}
          </Card>
        </Col>
      </Row>



    </div>
  );
}