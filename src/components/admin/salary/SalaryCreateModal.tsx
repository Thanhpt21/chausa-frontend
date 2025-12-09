'use client';

import { Modal, Form, Input, Button, message, InputNumber, Select, DatePicker, Row, Col, Divider, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useCreateSalary } from '@/hooks/salary/useCreateSalary';
import { useAllEmployees } from '@/hooks/employee/useAllEmployees';
import { Employee } from '@/types/employee.type';
import moment from 'moment';
import { formatCurrency } from '@/utils/helpers';

interface SalaryCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

const { Text } = Typography;

export const SalaryCreateModal = ({
  open,
  onClose,
  refetch,
}: SalaryCreateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useCreateSalary();
  const { data: employees } = useAllEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [calculatedNetSalary, setCalculatedNetSalary] = useState<number>(0);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        month: moment().month() + 1,
        year: moment().year(),
        totalWorkHours: 0,
        overtimeHours: 0,
        overtimeAmount: 0,
        leaveDays: 0,
        leaveHours: 0,
        bonus: 0,
        deduction: 0,
        allowance: 0,
        status: 'PENDING',
      });
      setSelectedEmployee(null);
      setCalculatedNetSalary(0);
    }
  }, [open, form]);

  const calculateNetSalary = () => {
    const baseSalary = form.getFieldValue('baseSalary') || 0;
    const overtimeAmount = form.getFieldValue('overtimeAmount') || 0;
    const bonus = form.getFieldValue('bonus') || 0;
    const allowance = form.getFieldValue('allowance') || 0;
    const deduction = form.getFieldValue('deduction') || 0;

    const netSalary = baseSalary + overtimeAmount + bonus + allowance - deduction;
    setCalculatedNetSalary(netSalary);
    form.setFieldsValue({ netSalary });
  };

  const handleEmployeeChange = (employeeId: number) => {
    const employee = employees?.find(emp => emp.id === employeeId) || null;
    setSelectedEmployee(employee);
    if (employee) {
      form.setFieldsValue({ baseSalary: employee.baseSalary });
      calculateNetSalary();
    }
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (
      changedValues.baseSalary !== undefined ||
      changedValues.overtimeAmount !== undefined ||
      changedValues.bonus !== undefined ||
      changedValues.allowance !== undefined ||
      changedValues.deduction !== undefined
    ) {
      calculateNetSalary();
    }
  };

  const onFinish = async (values: any) => {
    try {
      // Tính lại net salary trước khi gửi
      const netSalary = (values.baseSalary || 0) + 
                       (values.overtimeAmount || 0) + 
                       (values.bonus || 0) + 
                       (values.allowance || 0) - 
                       (values.deduction || 0);
      
      const formattedValues = {
        ...values,
        netSalary,
        paymentDate: values.paymentDate ? moment(values.paymentDate).format('YYYY-MM-DD') : undefined,
      };
      
      await mutateAsync(formattedValues);
      message.success('Tạo bảng lương thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi tạo bảng lương');
    }
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedEmployee(null);
      setCalculatedNetSalary(0);
    }
  }, [open, form]);

  return (
    <Modal
      title="Thêm bảng lương mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={800}
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nhân viên"
              name="employeeId"
              rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
            >
              <Select
                placeholder="Chọn nhân viên"
                onChange={handleEmployeeChange}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label?.toString().toLowerCase() || '').includes(input.toLowerCase())
                }
                options={employees?.map(emp => ({
                  value: emp.id,
                  label: `${emp.name} - ${emp.position} (${emp.department})`,
                }))}
              />
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item
              label="Tháng"
              name="month"
              rules={[{ required: true, message: 'Vui lòng chọn tháng' }]}
            >
              <Select
                placeholder="Tháng"
                options={[
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
                ]}
              />
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item
              label="Năm"
              name="year"
              rules={[{ required: true, message: 'Vui lòng nhập năm' }]}
            >
              <InputNumber
                placeholder="Năm"
                style={{ width: '100%' }}
                min={2000}
                max={2100}
              />
            </Form.Item>
          </Col>
        </Row>

        {selectedEmployee && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <Row gutter={16}>
              <Col span={8}>
                <div><strong>Nhân viên:</strong> {selectedEmployee.name}</div>
              </Col>
              <Col span={8}>
                <div><strong>Chức vụ:</strong> {selectedEmployee.position}</div>
              </Col>
              <Col span={8}>
                <div><strong>Phòng ban:</strong> {selectedEmployee.department}</div>
              </Col>
            </Row>
          </div>
        )}

        <Divider>Thông tin lương</Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Lương cơ bản (VND)"
              name="baseSalary"
              rules={[
                { required: true, message: 'Vui lòng nhập lương cơ bản' },
                { type: 'number', min: 0, message: 'Lương phải lớn hơn 0' }
              ]}
            >
              <InputNumber
                placeholder="Lương cơ bản"
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                onChange={calculateNetSalary}
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              label="Ngày làm thực tế"
              name="actualWorkDays"
              rules={[
                { required: true, message: 'Vui lòng nhập số ngày làm' },
                { type: 'number', min: 0, max: 31, message: 'Số ngày từ 0-31' }
              ]}
            >
              <InputNumber
                placeholder="Số ngày làm"
                style={{ width: '100%' }}
                min={0}
                max={31}
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              label="Tổng giờ làm"
              name="totalWorkHours"
            >
              <InputNumber
                placeholder="Tổng giờ làm"
                style={{ width: '100%' }}
                min={0}
                max={744} // 31 ngày * 24 giờ
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Giờ tăng ca"
              name="overtimeHours"
            >
              <InputNumber
                placeholder="Giờ tăng ca"
                style={{ width: '100%' }}
                min={0}
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              label="Tiền tăng ca (VND)"
              name="overtimeAmount"
            >
              <InputNumber
                placeholder="Tiền tăng ca"
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                min={0}
                onChange={calculateNetSalary}
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              label="Số ngày nghỉ"
              name="leaveDays"
            >
              <InputNumber
                placeholder="Số ngày nghỉ"
                style={{ width: '100%' }}
                min={0}
                max={31}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Số giờ nghỉ"
              name="leaveHours"
            >
              <InputNumber
                placeholder="Số giờ nghỉ"
                style={{ width: '100%' }}
                min={0}
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              label="Thưởng (VND)"
              name="bonus"
            >
              <InputNumber
                placeholder="Thưởng"
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                min={0}
                onChange={calculateNetSalary}
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              label="Phụ cấp (VND)"
              name="allowance"
            >
              <InputNumber
                placeholder="Phụ cấp"
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                min={0}
                onChange={calculateNetSalary}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Khấu trừ (VND)"
              name="deduction"
            >
              <InputNumber
                placeholder="Khấu trừ"
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                min={0}
                onChange={calculateNetSalary}
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              label="Trạng thái"
              name="status"
              initialValue="PENDING"
            >
              <Select
                options={[
                  { value: 'PENDING', label: 'Chờ xử lý' },
                  { value: 'CALCULATED', label: 'Đã tính toán' },
                  { value: 'APPROVED', label: 'Đã duyệt' },
                  { value: 'PAID', label: 'Đã thanh toán' },
                ]}
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              label="Ngày thanh toán"
              name="paymentDate"
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Ghi chú"
              name="notes"
            >
              <Input.TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>
          <div className="flex justify-between items-center">
            <span>Tổng lương</span>
            <Text strong type="success" style={{ fontSize: '18px' }}>
              {formatCurrency(calculatedNetSalary)}
            </Text>
          </div>
        </Divider>

        <Form.Item
          name="netSalary"
          hidden
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
            size="large"
          >
            Tạo bảng lương
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};