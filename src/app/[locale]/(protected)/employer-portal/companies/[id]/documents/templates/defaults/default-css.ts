import { DocumentType } from '@/types/template';

export function getPayslipCss(): string {
  return `/* --- PAYSLIP --- */
.payslip { padding: 24px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #111; background: #fff; max-width: 800px; margin: 0 auto; }
.payslip .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; }
.payslip .header h1 { margin: 0; font-size: 18px; }
.payslip .header h2 { margin: 0; color: #444; font-size: 14px; }
.payslip .doc-title { text-align: right; }
.payslip .employee-info { display: flex; gap: 40px; margin-bottom: 20px; font-size: 12px; }
.payslip .info-group { flex: 1; display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; }
.payslip .label { color: #666; font-weight: 600; white-space: nowrap; }
.payslip .value { color: #111; }
.payslip .salary-details { display: flex; gap: 24px; margin-bottom: 20px; }
.payslip .earnings, .payslip .deductions { flex: 1; }
.payslip .earnings h3, .payslip .deductions h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #444; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
.salary-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.salary-table td { padding: 5px 0; border-bottom: 1px solid #f0f0f0; }
.salary-table td:last-child { text-align: right; font-weight: 600; }
.net-pay-box { background: #111; color: #fff; padding: 16px 24px; text-align: center; margin: 16px 0; display: flex; align-items: center; justify-content: space-between; border-radius: 4px; }
.net-pay-box .label { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.7; }
.net-pay-box .amount { font-size: 22px; font-weight: 700; }
.statutory-info { font-size: 10px; color: #777; text-align: center; margin: 8px 0; font-style: italic; }
.signatures { display: flex; justify-content: space-between; margin-top: 48px; }
.sig { border-top: 1px solid #999; width: 180px; text-align: center; padding-top: 6px; font-size: 11px; color: #555; }`;
}

export function getSalarySheetCss(): string {
  return `/* --- SALARY SHEET --- */
.salary-sheet { padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #000; background: #fff; }
.salary-sheet .header { margin-bottom: 16px; }
.salary-sheet .header h1 { margin: 0; font-size: 16px; }
.salary-sheet .header h2 { margin: 0; font-size: 12px; color: #444; }
.salary-sheet .header p { margin: 2px 0 0; font-size: 10px; color: #777; }
.sheet-table { width: 100%; border-collapse: collapse; font-size: 10px; table-layout: auto; }
.sheet-table th, .sheet-table td { border: 1px solid #ccc; padding: 5px 4px; text-align: right; overflow: hidden; }
.sheet-table th { background: #f4f4f4; font-weight: 700; font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em; }
.sheet-table td.name-cell { text-align: left; font-weight: 500; min-width: 130px; }
.net-col { background: #f9f9f9; font-weight: 700; }
.totals-row td { background: #222; color: #fff; font-weight: 700; border-color: #222; }
thead { display: table-header-group; }
tr.employee-row { page-break-inside: avoid; }
.page-break { page-break-after: always; }`;
}

export function getAttendanceReportCss(): string {
  return `/* --- ATTENDANCE REPORT --- */
.attendance-report { padding: 24px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #111; background: #fff; }
.attendance-report .header { border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 14px; }
.attendance-report .header h1 { margin: 0; font-size: 16px; }
.attendance-report .header h2 { margin: 0; font-size: 12px; color: #444; }
.attendance-report .employee-info { display: flex; gap: 24px; margin-bottom: 14px; font-size: 12px; }
.attendance-report .employee-info span { color: #555; }
.att-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
.att-table th, .att-table td { border: 1px solid #ddd; padding: 6px 8px; text-align: center; }
.att-table th { background: #f4f4f4; font-weight: 700; font-size: 10px; text-transform: uppercase; }
.att-table tr:nth-child(even) { background: #fafafa; }
.summary { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px; }
.summary-item { border: 1px solid #e0e0e0; border-radius: 6px; padding: 10px 16px; min-width: 100px; text-align: center; }
.summary-item span { display: block; font-size: 10px; color: #777; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
.summary-item strong { font-size: 18px; }`;
}

export function getDefaultCss(type?: DocumentType): string {
  if (!type) {
    return getPayslipCss();
  }
  switch (type) {
    case DocumentType.PAYSLIP:
      return getPayslipCss();
    case DocumentType.SALARY_SHEET:
      return getSalarySheetCss();
    case DocumentType.ATTENDANCE_REPORT:
      return getAttendanceReportCss();
    default:
      return '';
  }
}
