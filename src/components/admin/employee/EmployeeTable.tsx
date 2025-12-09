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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

import { useEmployees } from '@/hooks/employee/useEmployees';
import { useDeleteEmployee } from '@/hooks/employee/useDeleteEmployee';
import { Employee } from '@/types/employee.type';
import { EmployeeCreateModal } from './EmployeeCreateModal';
import { EmployeeUpdateModal } from './EmployeeUpdateModal';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { useRouter } from 'next/navigation';

export default function EmployeeTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [department, setDepartment] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [openListModal, setOpenListModal] = useState(false);

  const { data, isLoading, refetch } = useEmployees({ 
    page, 
    limit: 10, 
    search, 
    department, 
    isActive 
  });
  const { mutateAsync: deleteEmployee } = useDeleteEmployee();

  const columns: ColumnsType<Employee> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên nhân viên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string | null) => phone || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string | null) => email || '-',
    },
    {
      title: 'Chức vụ',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      render: (department: string) => (
        <Tag color="blue">{department}</Tag>
      ),
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      key: 'baseSalary',
      render: (salary: number) => formatCurrency(salary),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Đang làm việc' : 'Đã nghỉ'}
        </Tag>
      ),
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: Date | string) => formatDate(date),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem lương">
            <DollarOutlined
              style={{ color: '#52c41a', cursor: 'pointer' }}
              onClick={() => router.push(`/admin/salaries?employeeId=${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedEmployee(record);
                setOpenUpdate(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xoá nhân viên',
                  content: `Bạn có chắc chắn muốn xoá "${record.name}" không?`,
                  okText: 'Xoá',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteEmployee(record.id);
                      message.success('Xoá nhân viên thành công');
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
    setDepartment('');
    setIsActive(undefined);
    setPage(1);
  };

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
            <Button onClick={handleReset}>Reset</Button>
          </div>
          <div className='flex justify-content gap-2'>
            <Button onClick={() => setOpenListModal(true)}>
              Xem tất cả
            </Button>
            <Button type="primary" onClick={() => setOpenCreate(true)}>
              Thêm nhân viên
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span className="mr-2">Phòng ban:</span>
            <Input
              placeholder="Nhập phòng ban"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              style={{ width: 200 }}
            />
          </div>
          <div>
            <span className="mr-2">Trạng thái:</span>
            <Button
              type={isActive === true ? 'primary' : 'default'}
              onClick={() => {
                setIsActive(isActive === true ? undefined : true);
                setPage(1);
              }}
            >
              Đang làm
            </Button>
            <Button
              type={isActive === false ? 'primary' : 'default'}
              onClick={() => {
                setIsActive(isActive === false ? undefined : false);
                setPage(1);
              }}
              style={{ marginLeft: 8 }}
            >
              Đã nghỉ
            </Button>
            {isActive !== undefined && (
              <Button
                type="link"
                onClick={() => setIsActive(undefined)}
                style={{ marginLeft: 8 }}
              >
                Xóa lọc
              </Button>
            )}
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

      <EmployeeCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        refetch={refetch}
      />

      <EmployeeUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        employee={selectedEmployee}
        refetch={refetch}
      />

    </div>
  );
}