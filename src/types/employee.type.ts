export interface Employee {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  position: string;
  department: string;
  baseSalary: number;
  salaryCurrency: string;
  startDate: Date;
  isActive: boolean;
  bankName: string | null;
  bankAccount: string | null;
  bankAccountName: string | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeSalary {
  id: number;
  employeeId: number;
  month: number;
  year: number;
  baseSalary: number;
  actualWorkDays: number;
  totalWorkHours: number;
  overtimeHours: number;
  overtimeAmount: number;
  leaveDays: number;
  leaveHours: number;
  bonus: number;
  deduction: number;
  allowance: number;
  netSalary: number;
  status: 'PENDING' | 'CALCULATED' | 'APPROVED' | 'PAID' | 'CANCELLED';
  paymentDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryWithEmployee extends EmployeeSalary {
  employee: {
    id: number;
    name: string;
    position: string;
    department: string;
  };
}

export interface EmployeeWithSalaries extends Employee {
  salaries: EmployeeSalary[];
  _count: {
    salaries: number;
  };
}

export interface SalaryReport {
  id: number;
  employeeId: number;
  employeeName: string;
  position: string;
  department: string;
  month: number;
  year: number;
  baseSalary: number;
  actualWorkDays: number;
  overtimeHours: number;
  overtimeAmount: number;
  leaveDays: number;
  bonus: number;
  deduction: number;
  allowance: number;
  netSalary: number;
  status: string;
  paymentDate: Date | null;
  bankName: string | null;
  bankAccount: string | null;
  bankAccountName: string | null;
  notes: string | null;
}