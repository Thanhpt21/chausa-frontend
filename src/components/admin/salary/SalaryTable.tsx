'use client';

import {
  Table,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
  Tag,
  Select,
  InputNumber,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { useSalaries } from '@/hooks/salary/useSalaries';
import { useDeleteSalary } from '@/hooks/salary/useDeleteSalary';
import { SalaryWithEmployee } from '@/types/salary.type';
import { SalaryCreateModal } from './SalaryCreateModal';
import { SalaryUpdateModal } from './SalaryUpdateModal';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { useAllEmployees } from '@/hooks/employee/useAllEmployees';
import { Employee } from '@/types/employee.type';

export default function SalaryTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeIdParam = searchParams.get('employeeId');
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [year, setYear] = useState<number | undefined>(new Date().getFullYear());
  const [month, setMonth] = useState<number | undefined>(new Date().getMonth() + 1);
  const [status, setStatus] = useState<string | undefined>();
  const [employeeId, setEmployeeId] = useState<number | undefined>(
    employeeIdParam ? parseInt(employeeIdParam) : undefined
  );
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalaryWithEmployee | null>(null);

  const { data, isLoading, refetch } = useSalaries({ 
    page, 
    limit: 10, 
    year, 
    month, 
    status, 
    employeeId 
  });
  const { data: employees } = useAllEmployees();
  const { mutateAsync: deleteSalary } = useDeleteSalary();

  useEffect(() => {
    if (employeeIdParam) {
      setEmployeeId(parseInt(employeeIdParam));
    }
  }, [employeeIdParam]);

  const columns: ColumnsType<SalaryWithEmployee> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Nhân viên',
      key: 'employee',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.employee.name}</div>
          <div className="text-sm text-gray-500">{record.employee.department}</div>
        </div>
      ),
    },
    {
      title: 'Tháng/Năm',
      key: 'monthYear',
      render: (_, record) => (
        <span>{record.month}/{record.year}</span>
      ),
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      key: 'baseSalary',
      render: (salary: number) => formatCurrency(salary),
    },
    {
      title: 'Ngày làm thực tế',
      dataIndex: 'actualWorkDays',
      key: 'actualWorkDays',
      render: (days: number) => `${days} ngày`,
    },
    {
      title: 'Giờ tăng ca',
      dataIndex: 'overtimeHours',
      key: 'overtimeHours',
      render: (hours: number) => `${hours} giờ`,
    },
    {
      title: 'Thưởng',
      dataIndex: 'bonus',
      key: 'bonus',
      render: (bonus: number) => formatCurrency(bonus),
    },
    {
      title: 'Lương thực nhận',
      dataIndex: 'netSalary',
      key: 'netSalary',
      render: (salary: number) => (
        <span className="font-bold text-green-600">
          {formatCurrency(salary)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          PENDING: { color: 'orange', text: 'Chờ xử lý' },
          CALCULATED: { color: 'blue', text: 'Đã tính' },
          APPROVED: { color: 'green', text: 'Đã duyệt' },
          PAID: { color: 'green', text: 'Đã thanh toán' },
          CANCELLED: { color: 'red', text: 'Đã hủy' },
        };
        
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date: Date | string | null) => date ? formatDate(date) : '-',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedSalary(record);
                setOpenUpdate(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá bảng lương',
                  content: `Bạn có chắc chắn muốn xoá bảng lương tháng ${record.month}/${record.year} của ${record.employee.name} không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteSalary(record.id);
                      message.success('Xoá bảng lương thành công');
                      refetch();
                    } catch (error: any) {
                      message.error(error?.response?.data?.message || 'Xoá thất bại');
                    }
                  },
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = () => {
    setPage(1);
    setSearch(inputValue);
  };

  const handleReset = () => {
    setSearch('');
    setInputValue('');
    setYear(new Date().getFullYear());
    setMonth(new Date().getMonth() + 1);
    setStatus(undefined);
    setEmployeeId(undefined);
    setPage(1);
    router.push('/admin/salaries');
  };

  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  const statusOptions = [
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'CALCULATED', label: 'Đã tính' },
    { value: 'APPROVED', label: 'Đã duyệt' },
    { value: 'PAID', label: 'Đã thanh toán' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

  return (
    <div style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
              className="w-full max-w-xs"
            />
            <Button type="primary" onClick={handleSearch}>
              <SearchOutlined /> Tìm kiếm
            </Button>
          </div>
          <div className='flex justify-content gap-2'>
            <Button 
              type="primary" 
              onClick={() => router.push('/admin/salaries/report')}
              icon={<FileTextOutlined />}
            >
              Báo cáo
            </Button>
            <Button type="primary" onClick={() => setOpenCreate(true)}>
              <PlusOutlined /> Thêm bảng lương
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm mb-1">Năm</label>
            <InputNumber
              placeholder="Năm"
              value={year}
              onChange={(value) => {
                setYear(value || undefined);
                setPage(1);
              }}
              style={{ width: '100%' }}
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">Tháng</label>
            <Select
              placeholder="Tháng"
              value={month}
              onChange={(value) => {
                setMonth(value);
                setPage(1);
              }}
              style={{ width: '100%' }}
              options={months}
              allowClear
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">Trạng thái</label>
            <Select
              placeholder="Trạng thái"
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              style={{ width: '100%' }}
              options={statusOptions}
              allowClear
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">Nhân viên</label>
            <Select
              placeholder="Nhân viên"
              value={employeeId}
              onChange={(value) => {
                setEmployeeId(value);
                setPage(1);
              }}
              style={{ width: '100%' }}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {employees?.map((emp: Employee) => (
                <Select.Option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.department}
                </Select.Option>
              ))}
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button onClick={handleReset} icon={<ReloadOutlined />}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: data?.total,
            current: page,
            pageSize: 10,
            onChange: (p) => setPage(p),
          }}
        />
      </div>

      <SalaryCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <SalaryUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        salary={selectedSalary}
        refetch={refetch}
      />
    </div>
  );
}