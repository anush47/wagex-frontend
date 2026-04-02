/**
 * Sample data for template previews.
 * Mirrors the actual database schema fields exactly.
 */

const SAMPLE_COMPANY = {
  id: 'c1512d1b-9359-4e8b-b140-c9496a946ca1',
  name: 'AKURU COLOUR GRAPHICS',
  address: '473, Athurugiriya Rd., Malabe.',
  phone: '+94 11 234 5678',
  email: 'info@akuru.lk',
  logo: '/logo-placeholder.png',
  timezone: 'Asia/Colombo',
  employerNumber: 'X/12345',
  startedDate: '2026-02-28',
  defaultStatutoryPaymentMethod: 'BANK_TRANSFER',
};

const SAMPLE_EMPLOYEE = {
  id: 'b7e20354-6638-469f-80bd-2d5e308008a4',
  employeeNo: '1',
  nic: '195675675758',
  nameWithInitials: 'ANUSH',
  fullName: 'ANUSHANGA SHARADA GALA',
  designation: 'SSE',
  address: '238/1, Thunandahena, Korathota, Kaduwela.',
  phone: '+94717539478',
  email: '',
  employmentType: 'PERMANENT',
  joinedDate: '2026-04-01',
  gender: 'MALE',
  status: 'ACTIVE',
  basicSalary: 30000,
  department: { name: 'Engineering' },
  details: {
    bankName: '',
    bankBranch: '',
    accountNumber: '',
    mothersName: '',
    fathersName: '',
    maritalStatus: 'SINGLE',
    spouseName: '',
    nationality: 'Sri Lankan',
    emergencyContactName: '',
    emergencyContactPhone: '',
  },
};

const SAMPLE_SALARY_COMPONENTS = [
  { id: 'bdcc99f0', name: 'Incentive', type: 'FLAT_AMOUNT', amount: 1000, category: 'ADDITION', systemType: 'NONE', isStatutory: false, affectsTotalEarnings: false },
  { id: 'holiday-pay', name: 'Holiday Pay', type: 'FLAT_AMOUNT', amount: 2625, category: 'ADDITION', systemType: 'HOLIDAY_PAY', isStatutory: true, affectsTotalEarnings: true },
  { id: 'epf', name: 'EPF', type: 'PERCENTAGE_TOTAL_EARNINGS', value: 8, amount: 770, category: 'DEDUCTION', systemType: 'EPF_EMPLOYEE', isStatutory: true, employerValue: 12, employerAmount: 1155, affectsTotalEarnings: false },
  { id: 'etf', name: 'ETF', type: 'PERCENTAGE_TOTAL_EARNINGS', value: 0, amount: 0, category: 'DEDUCTION', systemType: 'ETF_EMPLOYER', isStatutory: true, employerValue: 3, employerAmount: 288.75, affectsTotalEarnings: false },
  { id: 'welfare', name: 'Welfare', type: 'FLAT_AMOUNT', value: 250, amount: 250, category: 'DEDUCTION', systemType: 'NONE', isStatutory: false, affectsTotalEarnings: false },
];

const SAMPLE_SALARY = {
  id: '50a52096-a936-4d01-87e2-f53f407aa4fc',
  month: 3,
  year: 2026,
  periodStartDate: '2026-03-01',
  periodEndDate: '2026-03-31',
  payDate: '2026-03-31',
  basicSalary: 30000,
  otAmount: 0,
  otBreakdown: [],
  holidayPayAmount: 2625,
  holidayPayBreakdown: [{ hours: 10.5, amount: 2625, holidayName: 'Off Day OT', affectTotalEarnings: true }],
  noPayAmount: 23000,
  noPayBreakdown: [
    { type: 'ABSENCE', count: 23, amount: 23000, reason: 'Absence without leave' },
    { type: 'UNPAID_LEAVE', count: 0, amount: 0, reason: 'Approved unpaid leave' },
    { type: 'LATE', count: 0, amount: 0, reason: 'Late arrivals / Early leaves (+0m)' },
  ],
  taxAmount: 0,
  advanceDeduction: 0,
  lateDeduction: 0,
  otAdjustment: 0,
  lateAdjustment: 0,
  holidayPayAdjustment: 0,
  recoveryAdjustment: 0,
  advanceAdjustments: [],
  netSalary: 30000,
  status: 'DRAFT',
  remarks: '',
  components: SAMPLE_SALARY_COMPONENTS,
  // Pre-filtered for convenience in templates
  additions: SAMPLE_SALARY_COMPONENTS.filter(c => c.category === 'ADDITION'),
  deductions: SAMPLE_SALARY_COMPONENTS.filter(c => c.category === 'DEDUCTION'),
  // EPF/ETF shortcuts
  epfEmployee: 770,
  epfEmployer: 1155,
  etfEmployer: 288.75,
};

const SAMPLE_ATTENDANCE_LOG = {
  id: 'c36dac8c-166e-409c-961c-f5ef68b0e989',
  date: '2026-03-08',
  shiftName: 'Standard Shift',
  shiftStartTime: '09:00',
  shiftEndTime: '17:00',
  shiftBreakMinutes: 60,
  checkInTime: '2026-03-08 09:10:00',
  checkOutTime: '2026-03-08 17:40:00',
  totalMinutes: 690,
  breakMinutes: 60,
  workMinutes: 630,
  overtimeMinutes: 150,
  isLate: false,
  lateMinutes: 0,
  isEarlyLeave: false,
  earlyLeaveMinutes: 0,
  isOnLeave: false,
  workDayStatus: 'WORKING_DAY',
  inApprovalStatus: 'APPROVED',
  outApprovalStatus: 'APPROVED',
  payrollStatus: 'PROCESSED',
};

const SAMPLE_LEAVE = {
  id: '58d2e8cc-3acd-44e0-9ad3-e17737c42180',
  leaveTypeName: 'Casual Leave',
  type: 'FULL_DAY',
  startDate: '2026-03-10',
  endDate: '2026-03-10',
  days: 1,
  leaveNumber: 1,
  status: 'PENDING',
  reason: '',
};

export function getPayslipSampleData() {
  return {
    company: SAMPLE_COMPANY,
    employee: SAMPLE_EMPLOYEE,
    salary: SAMPLE_SALARY,
    month: SAMPLE_SALARY.month,
    year: SAMPLE_SALARY.year,
    periodStartDate: SAMPLE_SALARY.periodStartDate,
    periodEndDate: SAMPLE_SALARY.periodEndDate,
    payDate: SAMPLE_SALARY.payDate,
    // Top-level shortcuts (for backwards compat with simple templates)
    basicSalary: SAMPLE_SALARY.basicSalary,
    netSalary: SAMPLE_SALARY.netSalary,
    otAmount: SAMPLE_SALARY.otAmount,
    holidayPayAmount: SAMPLE_SALARY.holidayPayAmount,
    noPayAmount: SAMPLE_SALARY.noPayAmount,
    taxAmount: SAMPLE_SALARY.taxAmount,
    advanceDeduction: SAMPLE_SALARY.advanceDeduction,
    lateDeduction: SAMPLE_SALARY.lateDeduction,
    epfEmployee: SAMPLE_SALARY.epfEmployee,
    epfEmployer: SAMPLE_SALARY.epfEmployer,
    etfEmployer: SAMPLE_SALARY.etfEmployer,
    additions: SAMPLE_SALARY.additions,
    deductions: SAMPLE_SALARY.deductions,
    components: SAMPLE_SALARY.components,
  };
}

export function getSalarySheetSampleData() {
  const additionNames = ['Incentive', 'Holiday Pay'];
  const deductionNames = ['EPF', 'ETF', 'Welfare'];

  const buildRow = (i: number) => ({
    employee: {
      ...SAMPLE_EMPLOYEE,
      id: `emp-${i}`,
      employeeNo: String(i + 1),
      fullName: i % 2 === 0 ? 'ANUSHANGA SHARADA GALA' : 'JANE SMITH PERERA',
      nameWithInitials: i % 2 === 0 ? 'ANUSH' : 'JANE',
      designation: i % 2 === 0 ? 'SSE' : 'Accountant',
      department: { name: i % 2 === 0 ? 'Engineering' : 'Finance' },
    },
    salary: {
      ...SAMPLE_SALARY,
      id: `sal-${i}`,
      basicSalary: 30000 + i * 5000,
      netSalary: 28000 + i * 5000,
      otAmount: i % 3 === 0 ? 2500 : 0,
      holidayPayAmount: i % 2 === 0 ? 2625 : 0,
      noPayAmount: i % 4 === 0 ? 1000 : 0,
      epfEmployee: (30000 + i * 5000) * 0.08,
      epfEmployer: (30000 + i * 5000) * 0.12,
      etfEmployer: (30000 + i * 5000) * 0.03,
    },
    // Per-row addition/deduction columns (keyed by name)
    additionAmounts: Object.fromEntries(additionNames.map((n, j) => [n, j === 0 ? 1000 : 2625 * (i % 2)])),
    deductionAmounts: Object.fromEntries(deductionNames.map(n => [n, n === 'EPF' ? (30000 + i * 5000) * 0.08 : n === 'ETF' ? (30000 + i * 5000) * 0.03 : 250])),
    // Shortcuts
    basicSalary: 30000 + i * 5000,
    netSalary: 28000 + i * 5000,
    otAmount: i % 3 === 0 ? 2500 : 0,
    epfEmployee: (30000 + i * 5000) * 0.08,
    epfEmployer: (30000 + i * 5000) * 0.12,
    etfEmployer: (30000 + i * 5000) * 0.03,
    holidayPayAmount: i % 2 === 0 ? 2625 : 0,
    noPayAmount: i % 4 === 0 ? 1000 : 0,
  });

  const salaries = Array.from({ length: 5 }, (_, i) => buildRow(i));

  return {
    company: SAMPLE_COMPANY,
    month: 3,
    year: 2026,
    periodStartDate: '2026-03-01',
    periodEndDate: '2026-03-31',
    additionColumns: additionNames,
    deductionColumns: deductionNames,
    salaries,
    totals: {
      basicSalary: salaries.reduce((s, r) => s + r.basicSalary, 0),
      netSalary: salaries.reduce((s, r) => s + r.netSalary, 0),
      otAmount: salaries.reduce((s, r) => s + r.otAmount, 0),
      epfEmployee: salaries.reduce((s, r) => s + r.epfEmployee, 0),
      epfEmployer: salaries.reduce((s, r) => s + r.epfEmployer, 0),
      etfEmployer: salaries.reduce((s, r) => s + r.etfEmployer, 0),
      holidayPayAmount: salaries.reduce((s, r) => s + r.holidayPayAmount, 0),
      noPayAmount: salaries.reduce((s, r) => s + r.noPayAmount, 0),
      additionAmounts: Object.fromEntries(additionNames.map(n => [n, salaries.reduce((s, r) => s + (r.additionAmounts[n] || 0), 0)])),
      deductionAmounts: Object.fromEntries(deductionNames.map(n => [n, salaries.reduce((s, r) => s + (r.deductionAmounts[n] || 0), 0)])),
    },
  };
}

export function getAttendanceSampleData() {
  return {
    company: SAMPLE_COMPANY,
    employee: SAMPLE_EMPLOYEE,
    month: 3,
    year: 2026,
    periodStartDate: '2026-03-01',
    periodEndDate: '2026-03-31',
    logs: Array.from({ length: 26 }, (_, i) => ({
      ...SAMPLE_ATTENDANCE_LOG,
      id: `att-${i}`,
      date: `2026-03-${String(i + 1).padStart(2, '0')}`,
      workDayStatus: i % 7 >= 5 ? 'OFF_DAY' : 'WORKING_DAY',
      checkInTime: i % 7 >= 5 ? null : `2026-03-${String(i + 1).padStart(2, '0')} 09:10:00`,
      checkOutTime: i % 7 >= 5 ? null : `2026-03-${String(i + 1).padStart(2, '0')} 17:40:00`,
      isLate: i % 5 === 0,
      lateMinutes: i % 5 === 0 ? 10 : 0,
      overtimeMinutes: i % 3 === 0 ? 90 : 0,
    })),
    leaves: [SAMPLE_LEAVE],
    summary: {
      totalDays: 26,
      workingDays: 22,
      presentDays: 21,
      absentDays: 1,
      lateDays: 3,
      overtimeMinutes: 540,
      leavesTaken: 1,
    },
  };
}

import { DocumentType } from '@/types/template';

export function getSampleData(type: DocumentType) {
  switch (type) {
    case DocumentType.PAYSLIP:
      return getPayslipSampleData();
    case DocumentType.SALARY_SHEET:
      return getSalarySheetSampleData();
    case DocumentType.ATTENDANCE_REPORT:
      return getAttendanceSampleData();
    default:
      return {};
  }
}
