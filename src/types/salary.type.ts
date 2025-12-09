import { EmployeeSalary, SalaryWithEmployee, SalaryReport } from './employee.type';

export type { EmployeeSalary, SalaryWithEmployee, SalaryReport };

export interface SalarySummary {
  year: number;
  month?: number;
  totalEmployees: number;
  totalSalaries: number;
  totalPaid: number;
  totalBonus: number;
  totalOvertime: number;
  totalDeduction: number;
  averageSalary: number;
  departmentStats: Record<string, { count: number; total: number }>;
  salaries: Array<{
    id: number;
    employeeId: number;
    employeeName: string;
    department: string;
    month: number;
    year: number;
    baseSalary: number;
    netSalary: number;
    status: string;
    paymentDate: Date | null;
  }>;
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalEmployees: number;
  totalAmount: number;
  salaries: SalaryReport[];
}

export interface EmployeeSalaryReport {
  employee: {
    id: number;
    name: string;
    position: string;
    department: string;
    baseSalary: number;
    startDate: Date;
  };
  summary: {
    totalSalaries: number;
    totalAmount: number;
    averageMonthly: number;
  };
  yearlyStats: Array<{
    year: number;
    total: number;
    count: number;
    average: number;
  }>;
  salaries: Array<{
    id: number;
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
  }>;
}