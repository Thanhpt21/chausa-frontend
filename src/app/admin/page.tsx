'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Spin, Statistic } from 'antd';
import { useAllCustomers } from '@/hooks/customer/useAllCustomers';
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { useImportStats } from '@/hooks/import/useImportStats';
import { useExportStats } from '@/hooks/export/useExportStats';
import { useTotalRevenue } from '@/hooks/export/useTotalRevenue';
import { useTotalImportValue } from '@/hooks/import/useTotalImportValue';
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
  RiseOutlined,
  FallOutlined,
  TransactionOutlined,
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
    loadingTotalExtraCost;

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

  const totalRevenueAll = (totalRevenueData?.totalRevenue ?? 0) + (totalRevenueData?.totalAdditionalCost ?? 0) - (totalRevenueData?.totalExtraCost ?? 0);

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Trang Quản Trị</h1>

      {/* Dòng 1: Chọn khoảng thời gian */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={6}>
          {mounted ? (
            <RangePicker
              onChange={handleDateChange}
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          ) : (
            <div style={{ height: 32, backgroundColor: '#f0f0f0', borderRadius: 6 }}></div>
          )}
        </Col>
      </Row>

      {/* TỔNG QUAN DOANH THU & CHI PHÍ */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Card
            title={
              <span className="text-lg font-semibold">
                <TransactionOutlined className="mr-2 text-blue-600" />
                Tổng quan doanh thu & chi phí từ {start} đến {end}
              </span>
            }
            bordered={false}
            className="shadow-md"
          >
            <Row gutter={[16, 16]}>
              {/* Doanh thu chung */}
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Tổng doanh thu"
                  value={totalRevenueAll}
                  formatter={(value) => renderValue(value as number)}
                  prefix={<RiseOutlined className="text-green-600" />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>

              {/* Chi phí nhập kho */}
              {/* <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Chi phí nhập kho"
                  value={totalImportValueData?.totalImportValue}
                  formatter={(value) => renderValue(value as number)}
                  prefix={<FallOutlined className="text-red-600" />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col> */}

              {/* Doanh thu đã nhận */}
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Đã nhận"
                  value={totalPrepaymentSumData?.totalAmount}
                  formatter={(value) => renderValue(value as number)}
                  prefix={<DollarCircleOutlined className="text-orange-600" />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>

              {/* Chưa nhận */}
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Chưa nhận"
                  value={remainingRevenue}
                  formatter={(value) => renderValue(value as number)}
                  prefix={<FileSyncOutlined className="text-blue-600" />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>

              {/* Chi phí xuất kho */}
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Chi phí xuất kho"
                  value={totalRevenueForTransferData?.totalRevenue}
                  formatter={(value) => renderValue(value as number)}
                  prefix={<ArrowUpOutlined className="text-purple-600" />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* THỐNG KÊ CHI TIẾT DOANH THU */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Doanh thu đơn hàng - COMMENTED FOR FUTURE USE */}
        {/* <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <DollarCircleOutlined className="mr-2 text-purple-600" />
                Tổng doanh thu đơn hàng
              </span>
            }
            bordered={false}
            className="shadow-md h-full"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">Tổng doanh thu:</span>
                <span className="text-purple-600 font-semibold">
                  {renderValue(totalRevenueData?.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2">
                <span>Phí cộng thêm:</span>
                <span className="text-blue-600">{renderValue(totalRevenueData?.totalAdditionalCost)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>Phí phát sinh:</span>
                <span className="text-green-600">{renderValue(totalRevenueData?.totalExtraCost)}</span>
              </div>
              
              <div className="mt-4 pt-3 border-t">
                <h4 className="font-semibold text-green-700 mb-2">
                  <FileProtectOutlined className="mr-1" />
                  Đơn hàng "Hoàn thành"
                </h4>
                <p className="text-sm">Doanh thu: {renderValue(totalRevenueData?.totalRevenueCompleted)}</p>
              </div>

              <div className="pt-3 border-t">
                <h4 className="font-semibold text-cyan-700 mb-2">
                  <FileSyncOutlined className="mr-1" />
                  Đơn hàng "Đã xuất kho"
                </h4>
                <p className="text-sm">Dự kiến sẽ nhận: {renderValue(totalRevenueData?.totalRevenueExported)}</p>
                <p className="text-sm">Đã nhận thực tế: {renderValue(totalPrepaymentSumData?.totalAmount)}</p>
                <p className="text-sm">Còn lại chưa nhận: {renderValue(remainingRevenue)}</p>
              </div>
            </div>
          </Card>
        </Col> */}

        {/* Chi phí phát sinh - COMMENTED FOR FUTURE USE */}
        {/* <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <ShoppingCartOutlined className="mr-2 text-red-600" />
                Tổng chi phí phát sinh nhập kho
              </span>
            }
            bordered={false}
            className="shadow-md h-full"
          >
            <div className="text-center py-8">
              <p className="text-2xl font-semibold text-purple-600">
                {renderValue(totalExtraCostData?.totalExtraCost)}
              </p>
            </div>
          </Card>
        </Col> */}

        {/* Chi phí xuất kho */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <ArrowUpOutlined className="mr-2 text-gray-600" />
                Tổng chi phí xuất kho
              </span>
            }
            bordered={false}
            className="shadow-md h-full"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-semibold">Tổng chi phí:</span>
                <span className="text-purple-600 font-semibold text-lg">
                  {renderValue(totalRevenueForTransferData?.totalRevenue)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="p-2 bg-green-50 rounded">
                  <h4 className="font-semibold text-green-700 mb-1">
                    <FileProtectOutlined className="mr-1" />
                    "Đã Hoàn thành"
                  </h4>
                  <p className="text-sm">Chi phí: {renderValue(totalRevenueForTransferData?.totalRevenueCompleted)}</p>
                </div>

                <div className="p-2 bg-cyan-50 rounded">
                  <h4 className="font-semibold text-cyan-700 mb-1">
                    <FileSyncOutlined className="mr-1" />
                    "Đã xuất kho"
                  </h4>
                  <p className="text-sm">Chi phí: {renderValue(totalRevenueForTransferData?.totalRevenueExported)}</p>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Biểu đồ tổng quan - COMMENTED FOR FUTURE USE */}
        {/* <Col xs={24} md={12}>
          <Card title="Biểu đồ tổng quan" bordered={false} className="shadow-md">
            {mounted && !isLoading ? (
              <RevenueChart data={revenueChartData} options={revenueChartOptions} />
            ) : (
              <div className="flex justify-center items-center h-64">
                <Spin />
              </div>
            )}
          </Card>
        </Col> */}
      </Row>

      {/* THỐNG KÊ PHIẾU VÀ ĐỐI TƯỢNG */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Phiếu nhập kho */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card 
            title={
              <span className="flex items-center">
                <InboxOutlined className="mr-2 text-orange-500" />
                Phiếu nhập kho
              </span>
            } 
            bordered={false}
            className="shadow-md text-center"
          >
            {mounted && !isLoading ? (
              <>
                <p className="text-3xl font-bold text-orange-500 mb-3">{importStats?.total ?? 0}</p>
                <div className="space-y-1 text-left">
                  <p className="text-sm flex justify-between">
                    <span>Chờ xử lý:</span>
                    <span className="font-medium">{importStats?.pending ?? 0}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span>Đã nhập kho:</span>
                    <span className="font-medium text-green-600">{importStats?.completed ?? 0}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span>Đã huỷ:</span>
                    <span className="font-medium text-red-600">{importStats?.cancelled ?? 0}</span>
                  </p>
                </div>
              </>
            ) : (
              <div className="py-8">
                <Spin size="small" />
              </div>
            )}
          </Card>
        </Col>

        {/* Phiếu đề nghị mua hàng - COMMENTED FOR FUTURE USE */}
        {/* <Col xs={24} sm={12} md={8} lg={6}>
          <Card 
            title={
              <span className="flex items-center">
                <FileDoneOutlined className="mr-2 text-blue-600" />
                Phiếu đề nghị mua hàng
              </span>
            } 
            bordered={false}
            className="shadow-md text-center"
          >
            {mounted && !isLoading ? (
              <>
                <p className="text-3xl font-bold text-blue-600 mb-3">{purchaseRequestStats?.total ?? 0}</p>
                <div className="space-y-1 text-left">
                  <p className="text-sm flex justify-between">
                    <span>Chờ xử lý:</span>
                    <span className="font-medium">{purchaseRequestStats?.pending ?? 0}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span>Hoàn thành:</span>
                    <span className="font-medium text-green-600">{purchaseRequestStats?.completed ?? 0}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span>Đã huỷ:</span>
                    <span className="font-medium text-red-600">{purchaseRequestStats?.cancelled ?? 0}</span>
                  </p>
                </div>
              </>
            ) : (
              <div className="py-8">
                <Spin size="small" />
              </div>
            )}
          </Card>
        </Col> */}

        {/* Phiếu xuất đơn hàng - COMMENTED FOR FUTURE USE */}
        {/* <Col xs={24} sm={12} md={8} lg={6}>
          <Card 
            title={
              <span className="flex items-center">
                <FileDoneOutlined className="mr-2 text-red-500" />
                Phiếu xuất đơn hàng
              </span>
            } 
            bordered={false}
            className="shadow-md text-center"
          >
            {mounted && !isLoading ? (
              <>
                <p className="text-3xl font-bold text-red-500 mb-3">{exportStats?.total ?? 0}</p>
                <div className="space-y-1 text-left text-xs">
                  <p className="flex justify-between">
                    <span>Chờ xử lý:</span>
                    <span className="font-medium">{exportStats?.pending ?? 0}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Đã xuất kho:</span>
                    <span className="font-medium text-orange-600">{exportStats?.exporting ?? 0}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Đã huỷ:</span>
                    <span className="font-medium text-red-600">{exportStats?.cancelled ?? 0}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Từ chối:</span>
                    <span className="font-medium text-purple-600">{exportStats?.rejected ?? 0}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Hoàn thành:</span>
                    <span className="font-medium text-green-600">{exportStats?.completed ?? 0}</span>
                  </p>
                </div>
              </>
            ) : (
              <div className="py-8">
                <Spin size="small" />
              </div>
            )}
          </Card>
        </Col> */}

        {/* Phiếu xuất kho */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card 
            title={
              <span className="flex items-center">
                <FileTextOutlined className="mr-2 text-red-500" />
                Phiếu xuất kho
              </span>
            } 
            bordered={false}
            className="shadow-md text-center"
          >
            {mounted && !isLoading ? (
              <>
                <p className="text-3xl font-bold text-red-500 mb-3">{transferStats?.total ?? 0}</p>
                <div className="space-y-1 text-left">
                  <p className="text-sm flex justify-between">
                    <span>Chờ xử lý:</span>
                    <span className="font-medium">{transferStats?.pending ?? 0}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span>Đã xuất kho:</span>
                    <span className="font-medium text-orange-600">{transferStats?.exported ?? 0}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span>Đã huỷ:</span>
                    <span className="font-medium text-red-600">{transferStats?.cancelled ?? 0}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span>Hoàn thành:</span>
                    <span className="font-medium text-green-600">{transferStats?.completed ?? 0}</span>
                  </p>
                </div>
              </>
            ) : (
              <div className="py-8">
                <Spin size="small" />
              </div>
            )}
          </Card>
        </Col>

        {/* Khách hàng & Sản phẩm */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card 
            title="Khách hàng & Sản phẩm" 
            bordered={false}
            className="shadow-md"
          >
            {mounted && !isLoading ? (
              <PieChartComponent
                title="Tỉ lệ Khách hàng & Sản phẩm"
                labels={['Khách hàng', 'Sản phẩm']}
                data={[customers?.length ?? 0, products?.length ?? 0]}
                colors={['#1890ff', '#52c41a']}
              />
            ) : (
              <div className="flex justify-center items-center h-32">
                <Spin size="small" />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* BIỂU ĐỒ THỐNG KÊ */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Biểu đồ nhập kho" bordered={false} className="shadow-md">
            {mounted && !isLoading && importStats ? (
              <ImportStatusChart stats={importStats} />
            ) : (
              <div className="flex justify-center items-center h-64">
                <Spin />
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Biểu đồ xuất kho" bordered={false} className="shadow-md">
            {mounted && !isLoading && exportStats ? (
              <ExportStatusChart stats={exportStats} />
            ) : (
              <div className="flex justify-center items-center h-64">
                <Spin />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}