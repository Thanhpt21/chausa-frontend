'use client';

import { Modal, Form, Input, Button, message, InputNumber, Select, DatePicker } from 'antd';
import { useEffect } from 'react';
import { useUpdateEmployee } from '@/hooks/employee/useUpdateEmployee';
import { Employee } from '@/types/employee.type';
import moment from 'moment';

interface EmployeeUpdateModalProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  refetch?: () => void;
}

export const EmployeeUpdateModal = ({
  open,
  onClose,
  employee,
  refetch,
}: EmployeeUpdateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useUpdateEmployee();

  useEffect(() => {
    if (employee && open) {
      form.setFieldsValue({
        name: employee.name,
        phone: employee.phone,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        baseSalary: employee.baseSalary,
        salaryCurrency: employee.salaryCurrency,
        startDate: employee.startDate ? moment(employee.startDate) : null,
        isActive: employee.isActive,
        bankName: employee.bankName,
        bankAccount: employee.bankAccount,
        bankAccountName: employee.bankAccountName,
        note: employee.note,
      });
    }
  }, [employee, open, form]);

  const onFinish = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
      };
      
      await mutateAsync({
        id: employee?.id!,
        data: formattedValues,
      });
      message.success('Cập nhật nhân viên thành công');
      onClose();
      form.resetFields();
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật nhân viên');
    }
  };

  return (
    <Modal
      title="Cập nhật thông tin nhân viên"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Tên nhân viên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="Nhập tên nhân viên" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Chức vụ"
            name="position"
            rules={[{ required: true, message: 'Vui lòng nhập chức vụ' }]}
          >
            <Input placeholder="Nhập chức vụ" />
          </Form.Item>

          <Form.Item
            label="Phòng ban"
            name="department"
            rules={[{ required: true, message: 'Vui lòng nhập phòng ban' }]}
          >
            <Input placeholder="Nhập phòng ban" />
          </Form.Item>

          <Form.Item
            label="Lương cơ bản (VND)"
            name="baseSalary"
            rules={[
              { required: true, message: 'Vui lòng nhập lương cơ bản' },
              { type: 'number', min: 0, message: 'Lương phải lớn hơn 0' }
            ]}
          >
            <InputNumber
              placeholder="Nhập lương cơ bản"
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="Ngày bắt đầu"
            name="startDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            label="Đơn vị tiền tệ"
            name="salaryCurrency"
          >
            <Select>
              <Select.Option value="VND">VND</Select.Option>
              <Select.Option value="USD">USD</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="isActive"
          >
            <Select>
              <Select.Option value={true}>Đang làm việc</Select.Option>
              <Select.Option value={false}>Đã nghỉ</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Form.Item
            label="Tên ngân hàng"
            name="bankName"
          >
            <Input placeholder="Nhập tên ngân hàng" />
          </Form.Item>

          <Form.Item
            label="Số tài khoản"
            name="bankAccount"
          >
            <Input placeholder="Nhập số tài khoản" />
          </Form.Item>
        </div>

        <Form.Item
          label="Tên chủ tài khoản"
          name="bankAccountName"
        >
          <Input placeholder="Nhập tên chủ tài khoản" />
        </Form.Item>

        <Form.Item
          label="Ghi chú"
          name="note"
        >
          <Input.TextArea rows={2} placeholder="Nhập ghi chú" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};