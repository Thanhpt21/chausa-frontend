'use client';

import { Card, Row, Col, DatePicker, Button, Table, Statistic, Form, Select, Input, Spin, Alert, Tabs, Tag } from 'antd';
import { useState, useEffect } from 'react';
import { SearchOutlined, DownloadOutlined, PrinterOutlined, CalendarOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useSalarySummary } from '@/hooks/salary/useSalarySummary';
import { formatCurrency } from '@/utils/helpers';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

interface SalaryData {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  month: number;
  year: number;
  baseSalary: number;
  netSalary: number;
  status: string;
  paymentDate: string;
}

interface DepartmentStats {
  [key: string]: {
    count: number;
    total: number;
  };
}

interface SummaryData {
  summary: {
    totalEmployees: number;
    totalSalaries: number;
    totalPaid: number;
    totalBonus: number;
    totalOvertime: number;
    totalDeduction: number;
    averageSalary: number;
  };
  departmentStats: DepartmentStats;
  salaries: SalaryData[];
}

interface MonthlyData {
  month: number;
  year: number; // Thêm thuộc tính year
  monthName: string;
  totalBaseSalary: number;
  totalNetSalary: number;
  employeeCount: number;
  paidCount: number;
  averageSalary: number;
}

interface DepartmentChartData {
  department: string;
  totalSalary: number;
  employeeCount: number;
  averageSalary: number;
}

export default function SalaryReportPage() {
  const [form] = Form.useForm();
  const [year, setYear] = useState<number>(moment().year());
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('summary');

  // Sử dụng hook để lấy dữ liệu tổng hợp
  const { 
    data: responseData, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useSalarySummary(year, month);

  // Lấy dữ liệu từ response - FIX: responseData đã là dữ liệu trực tiếp, không cần .data
  const summaryData: SummaryData | undefined = responseData as any;

  // Xử lý khi form search được submit
  const handleSearch = (values: any) => {
    if (values.year) {
      setYear(values.year);
    }
    if (values.month) {
      setMonth(values.month);
    } else {
      setMonth(undefined);
    }
  };

  // Tự động refetch khi year hoặc month thay đổi
  useEffect(() => {
    refetch();
  }, [year, month, refetch]);

  const handleExportExcel = () => {
    // Logic export Excel
    const dataToExport = summaryData?.salaries || [];
    const csvContent = convertToCSV(dataToExport);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `salary_summary_${year}${month ? '_' + month : ''}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Chuyển đổi dữ liệu sang CSV
  const convertToCSV = (data: SalaryData[]) => {
    const headers = ['ID', 'Tên nhân viên', 'Phòng ban', 'Tháng', 'Năm', 'Lương cơ bản', 'Lương thực nhận', 'Trạng thái', 'Ngày thanh toán'];
    const rows = data.map(item => [
      item.id,
      item.employeeName,
      item.department,
      item.month,
      item.year,
      item.baseSalary,
      item.netSalary,
      item.status,
      moment(item.paymentDate).format('DD/MM/YYYY')
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Tạo dữ liệu theo tháng từ salaries
  const getMonthlyData = (): MonthlyData[] => {
    if (!summaryData?.salaries) return [];
    
    const monthlyMap: { [key: string]: MonthlyData } = {};
    
    summaryData.salaries.forEach(salary => {
      const monthKey = `${salary.year}-${salary.month}`;
      const monthName = `Tháng ${salary.month}/${salary.year}`;
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: salary.month,
          year: salary.year, // Thêm năm
          monthName: monthName,
          totalBaseSalary: 0,
          totalNetSalary: 0,
          employeeCount: 0,
          paidCount: 0,
          averageSalary: 0
        };
      }
      
      monthlyMap[monthKey].totalBaseSalary += salary.baseSalary;
      monthlyMap[monthKey].totalNetSalary += salary.netSalary;
      monthlyMap[monthKey].employeeCount += 1;
      
      if (salary.status === 'PAID') {
        monthlyMap[monthKey].paidCount += 1;
      }
    });
    
    // Tính lương trung bình cho mỗi tháng
    Object.values(monthlyMap).forEach(monthData => {
      monthData.averageSalary = monthData.employeeCount > 0 
        ? monthData.totalNetSalary / monthData.employeeCount 
        : 0;
    });
    
    // Sắp xếp theo năm và tháng
    return Object.values(monthlyMap).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  };

  // Tạo dữ liệu theo phòng ban từ departmentStats
  const getDepartmentData = (): DepartmentChartData[] => {
    if (!summaryData?.departmentStats) return [];
    
    return Object.entries(summaryData.departmentStats).map(([department, stats]) => ({
      department,
      totalSalary: stats.total,
      employeeCount: stats.count,
      averageSalary: stats.count > 0 ? stats.total / stats.count : 0
    }));
  };

  // Cột cho bảng dữ liệu chi tiết
  const salaryColumns = [
    {
      title: 'Tên nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Tháng/Năm',
      key: 'monthYear',
      render: (_: any, record: SalaryData) => (
        <div>{record.month}/{record.year}</div>
      ),
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      key: 'baseSalary',
      render: (value: number) => (
        <div className="text-blue-600">
          {formatCurrency(value)}
        </div>
      ),
    },
    {
      title: 'Lương thực nhận',
      dataIndex: 'netSalary',
      key: 'netSalary',
      render: (value: number) => (
        <div className="text-green-600 font-semibold">
          {formatCurrency(value)}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          PENDING: { color: 'orange', text: 'Chờ xử lý' },
          CALCULATED: { color: 'blue', text: 'Đã tính toán' },
          APPROVED: { color: 'green', text: 'Đã duyệt' },
          PAID: { color: 'success', text: 'Đã thanh toán' },
          CANCELLED: { color: 'red', text: 'Đã hủy' },
        };
        const config = statusConfig[status] || { color: 'gray', text: status };
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date: string) => (
        <div>{moment(date).format('DD/MM/YYYY')}</div>
      ),
    },
  ];

  // Cột cho bảng dữ liệu theo tháng
  const monthColumns = [
    {
      title: 'Tháng/Năm',
      dataIndex: 'monthName',
      key: 'monthName',
      render: (text: string) => (
        <div className="font-medium">{text}</div>
      ),
    },
    {
      title: 'Tổng lương cơ bản',
      dataIndex: 'totalBaseSalary',
      key: 'totalBaseSalary',
      render: (value: number) => (
        <div className="text-blue-600 font-semibold">
          {formatCurrency(value)}
        </div>
      ),
    },
    {
      title: 'Tổng lương thực nhận',
      dataIndex: 'totalNetSalary',
      key: 'totalNetSalary',
      render: (value: number) => (
        <div className="text-green-600 font-semibold">
          {formatCurrency(value)}
        </div>
      ),
    },
    {
      title: 'Số nhân viên',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      render: (value: number) => (
        <Tag color="blue">{value} người</Tag>
      ),
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paidCount',
      key: 'paidCount',
      render: (value: number, record: MonthlyData) => (
        <div>
          <Tag color={value === record.employeeCount ? 'success' : 'warning'}>
            {value}/{record.employeeCount}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Lương trung bình',
      dataIndex: 'averageSalary',
      key: 'averageSalary',
      render: (value: number) => (
        <div className="text-purple-600 font-semibold">
          {formatCurrency(value)}
        </div>
      ),
    },
  ];

  // Cột cho bảng dữ liệu phòng ban
  const departmentColumns = [
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Tổng lương',
      dataIndex: 'totalSalary',
      key: 'totalSalary',
      render: (value: number) => (
        <div className="text-green-600 font-semibold">
          {formatCurrency(value)}
        </div>
      ),
    },
    {
      title: 'Số nhân viên',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      render: (value: number) => (
        <Tag color="blue">{value} người</Tag>
      ),
    },
    {
      title: 'Lương trung bình',
      dataIndex: 'averageSalary',
      key: 'averageSalary',
      render: (value: number) => (
        <div className="text-purple-600 font-semibold">
          {formatCurrency(value)}
        </div>
      ),
    },
  ];

  // Tính toán thống kê nhanh
  const getQuickStats = () => {
    const monthlyData = getMonthlyData();
    const departmentData = getDepartmentData();
    
    const highestSalaryMonth = monthlyData.length > 0 
      ? monthlyData.reduce((max, item) => 
          item.totalNetSalary > max.totalNetSalary ? item : max, 
          { totalNetSalary: 0, monthName: 'N/A' }
        ).monthName
      : 'N/A';
    
    const highestSalaryDept = departmentData.length > 0 
      ? departmentData.reduce((max, item) => 
          item.totalSalary > max.totalSalary ? item : max, 
          { totalSalary: 0, department: 'N/A' }
        ).department
      : 'N/A';
    
    return { highestSalaryMonth, highestSalaryDept };
  };

  const { highestSalaryMonth, highestSalaryDept } = getQuickStats();

  if (isError) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi tải dữ liệu"
          description={error?.message || 'Không thể tải dữ liệu báo cáo'}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Báo cáo lương tổng hợp</h1>
        <div className="flex space-x-2">
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportExcel}
            type="default"
            disabled={isLoading}
          >
            Xuất Excel
          </Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrintReport}
            type="primary"
            disabled={isLoading}
          >
            In báo cáo
          </Button>
        </div>
      </div>

      {/* Filter section */}
      <Card className="mb-6">
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSearch}
          initialValues={{
            year: moment().year(),
            month: undefined
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Năm" name="year">
                <Select
                  placeholder="Chọn năm"
                  onChange={(value) => setYear(value)}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = moment().year() - i;
                    return (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item label="Tháng" name="month">
                <Select
                  placeholder="Tất cả các tháng"
                  allowClear
                  onChange={(value) => setMonth(value || undefined)}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <Option key={i + 1} value={i + 1}>
                      Tháng {i + 1}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item label=" " colon={false}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                  loading={isLoading}
                  block
                >
                  Tìm kiếm
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <>
          {/* Statistics section */}
          <Row gutter={16} className="mb-6">
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng nhân viên"
                  value={summaryData?.summary?.totalEmployees || 0}
                  valueStyle={{ color: '#722ed1' }}
                  prefix={<TeamOutlined />}
                  suffix="người"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng lương đã thanh toán"
                  value={summaryData?.summary?.totalPaid || 0}
                  precision={0}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<DollarOutlined />}
                  suffix="VND"
                  formatter={(value) => value?.toLocaleString('vi-VN')}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Lương trung bình"
                  value={summaryData?.summary?.averageSalary || 0}
                  precision={0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<DollarOutlined />}
                  suffix="VND"
                  formatter={(value) => value?.toLocaleString('vi-VN')}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng khấu trừ"
                  value={summaryData?.summary?.totalDeduction || 0}
                  precision={0}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<DollarOutlined />}
                  suffix="VND"
                  formatter={(value) => value?.toLocaleString('vi-VN')}
                />
              </Card>
            </Col>
          </Row>

          {/* Tabs section */}
          <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-6">
            <TabPane tab="Tổng quan" key="summary">
              <Row gutter={16} className="mb-6">
                <Col span={12}>
                  <Card title="Thông tin tổng hợp">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tổng thưởng:</span>
                        <span className="text-lg font-bold text-orange-600">
                          {summaryData?.summary?.totalBonus ? 
                            formatCurrency(summaryData.summary.totalBonus) : '0 VND'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tổng tăng ca:</span>
                        <span className="text-lg font-bold text-yellow-600">
                          {summaryData?.summary?.totalOvertime ? 
                            formatCurrency(summaryData.summary.totalOvertime) : '0 VND'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tổng bảng lương:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {summaryData?.summary?.totalSalaries || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tổng phòng ban:</span>
                        <span className="text-lg font-bold text-purple-600">
                          {getDepartmentData().length}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Thống kê nhanh">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                        <span>Tháng có lương cao nhất:</span>
                        <span className="font-bold text-blue-700">
                          {highestSalaryMonth}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                        <span>Phòng ban chi trả cao nhất:</span>
                        <span className="font-bold text-green-700">
                          {highestSalaryDept}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                        <span>Số phòng ban:</span>
                        <span className="font-bold text-purple-700">
                          {getDepartmentData().length} phòng ban
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                        <span>Số tháng có dữ liệu:</span>
                        <span className="font-bold text-orange-700">
                          {getMonthlyData().length} tháng
                        </span>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Department summary table */}
              <Card title="Tổng hợp theo phòng ban" className="mb-6">
                <Table
                  columns={departmentColumns}
                  dataSource={getDepartmentData()}
                  rowKey="department"
                  pagination={false}
                  size="small"
                  summary={(pageData) => {
                    const totalSalary = pageData.reduce((sum, item) => sum + item.totalSalary, 0);
                    const totalEmployees = pageData.reduce((sum, item) => sum + item.employeeCount, 0);

                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <strong>Tổng cộng</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong className="text-green-600">{formatCurrency(totalSalary)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          <Tag color="blue">{totalEmployees} người</Tag>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <strong className="text-purple-600">
                            {formatCurrency(totalSalary / (totalEmployees || 1))}
                          </strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Card>
            </TabPane>

            <TabPane tab="Chi tiết bảng lương" key="details">
              <Card>
                <Table
                  columns={salaryColumns}
                  dataSource={summaryData?.salaries || []}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} bản ghi`,
                  }}
                  summary={(pageData) => {
                    const totalBase = pageData.reduce((sum, item) => sum + item.baseSalary, 0);
                    const totalNet = pageData.reduce((sum, item) => sum + item.netSalary, 0);

                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3}>
                          <strong>Tổng cộng</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <strong className="text-blue-600">{formatCurrency(totalBase)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4}>
                          <strong className="text-green-600">{formatCurrency(totalNet)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={5} colSpan={2}></Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Card>
            </TabPane>

            <TabPane tab="Dữ liệu theo tháng" key="monthly">
              <Card>
                <Table
                  columns={monthColumns}
                  dataSource={getMonthlyData()}
                  rowKey="monthName"
                  pagination={{
                    pageSize: 12,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} tháng`,
                  }}
                  summary={(pageData) => {
                    const totalBase = pageData.reduce((sum, item) => sum + item.totalBaseSalary, 0);
                    const totalNet = pageData.reduce((sum, item) => sum + item.totalNetSalary, 0);
                    const totalEmployees = pageData.reduce((sum, item) => sum + item.employeeCount, 0);
                    const totalPaid = pageData.reduce((sum, item) => sum + item.paidCount, 0);

                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <strong>Tổng cộng</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong className="text-blue-600">{formatCurrency(totalBase)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          <strong className="text-green-600">{formatCurrency(totalNet)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <Tag color="blue">{totalEmployees} người</Tag>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4}>
                          <Tag color="green">{totalPaid}/{totalEmployees}</Tag>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={5}>
                          <strong className="text-purple-600">
                            {formatCurrency(totalNet / (totalEmployees || 1))}
                          </strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Card>
            </TabPane>

            <TabPane tab="Dữ liệu theo phòng ban" key="department">
              <Card>
                <Table
                  columns={departmentColumns}
                  dataSource={getDepartmentData()}
                  rowKey="department"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} phòng ban`,
                  }}
                  summary={(pageData) => {
                    const totalSalary = pageData.reduce((sum, item) => sum + item.totalSalary, 0);
                    const totalEmployees = pageData.reduce((sum, item) => sum + item.employeeCount, 0);

                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <strong>Tổng cộng</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong className="text-green-600">{formatCurrency(totalSalary)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          <Tag color="blue">{totalEmployees} người</Tag>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <strong className="text-purple-600">
                            {formatCurrency(totalSalary / (totalEmployees || 1))}
                          </strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Card>
            </TabPane>
          </Tabs>

          {/* Print header */}
          <div className="no-print">
            <Card className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin báo cáo</h3>
              <Row gutter={16}>
                <Col span={12}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Ngày tạo báo cáo:</span>
                      <strong>{moment().format('DD/MM/YYYY HH:mm')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Kỳ báo cáo:</span>
                      <strong>
                        {month ? `Tháng ${month} năm ${year}` : `Năm ${year}`}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Số lượng bản ghi:</span>
                      <strong>{summaryData?.salaries?.length || 0} bảng lương</strong>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tổng số phòng ban:</span>
                      <strong>{Object.keys(summaryData?.departmentStats || {}).length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Trạng thái báo cáo:</span>
                      <Tag color="success">Hoàn thành</Tag>
                    </div>
                    <div className="flex justify-between">
                      <span>Người tạo báo cáo:</span>
                      <strong>Hệ thống</strong>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}