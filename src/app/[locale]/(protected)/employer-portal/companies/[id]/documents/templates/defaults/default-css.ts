import { DocumentType } from '@/types/template';

export function getPayslipCss(): string {
  return `/* --- PAYSLIP --- */
.payslip { padding: 24px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #111; background: #fff; max-width: 800px; margin: 0 auto; }
.payslip .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; }
.payslip .logo-section { display: flex; align-items: flex-start; gap: 12px; }
.payslip .company-logo { height: 40px; width: auto; object-fit: contain; }
.payslip .header h1 { margin: 0; font-size: 18px; }
.payslip .header p { margin: 0; font-size: 11px; color: #666; }
.payslip .doc-title-section { display: flex; align-items: center; gap: 16px; }
.payslip .doc-title { text-align: right; }
.payslip .employee-photo { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 1px solid #ddd; }
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
.salary-sheet .header-logo { display: flex; align-items: center; gap: 16px; }
.salary-sheet .company-logo { height: 32px; width: auto; object-fit: contain; }
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
.attendance-report .logo-section { display: flex; align-items: center; gap: 16px; }
.attendance-report .company-logo { height: 36px; width: auto; object-fit: contain; }
.attendance-report .header h1 { margin: 0; font-size: 16px; }
.attendance-report .header h2 { margin: 0; font-size: 12px; color: #444; }
.attendance-report .emp-header { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
.attendance-report .employee-photo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 1px solid #ddd; }
.attendance-report .employee-info { display: flex; gap: 24px; font-size: 12px; }
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

export function getStatutoryFormCss(): string {
  return `/* --- STATUTORY FORM (EPF / ETF) --- */
.statutory-form {
  padding: 28px 32px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #000;
  background: #fff;
  max-width: 900px;
  margin: 0 auto;
}

/* Compact Letterhead — text only, centered */
.form-letterhead {
  text-align: center;
  border-bottom: 1px solid #000;
  padding-bottom: 10px;
  margin-bottom: 10px;
}
.form-company { font-size: 14px; font-weight: 900; text-transform: uppercase; }
.form-company-meta { font-size: 9px; color: #555; font-weight: 500; margin-top: 2px; }

/* Title row */
.form-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  justify-content: center;
  border-bottom: 1px solid #000;
  padding-bottom: 8px;
  margin-bottom: 14px;
}
.form-title { font-size: 12px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }
.form-period { font-size: 9px; font-weight: 600; color: #555; }

/* Meta grid (bank details) */
.form-meta-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border: 1px solid #000;
  margin-bottom: 16px;
}
.meta-item {
  padding: 8px 10px;
  border-right: 1px solid #000;
}
.meta-item:last-child { border-right: none; }
.meta-item span { display: block; font-size: 8px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
.meta-item strong { font-size: 11px; font-weight: 800; }

/* Table */
.form-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  border: 1px solid #000;
  margin-bottom: 20px;
}
.form-table th {
  background: #000;
  color: #fff;
  padding: 9px 8px;
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: right;
  border-right: 1px solid #333;
}
.form-table th.name-cell { text-align: left; }
.form-table th:last-child { border-right: none; }
.form-table td {
  padding: 8px;
  text-align: right;
  border-right: 1px solid #000;
  border-bottom: 1px solid #000;
}
.form-table td.td-num { text-align: center; color: #888; }
.form-table td.name-cell { text-align: left; font-weight: 700; }
.form-table td:last-child { border-right: none; }
.bold { font-weight: 800; }
.totals-row td {
  background: #000;
  color: #fff;
  font-weight: 900;
  border-right: 1px solid #333;
  border-bottom: none;
}

/* Summary footer */
.form-summary {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.summary-box {
  border: 1px solid #000;
  padding: 10px 16px;
  text-align: right;
  min-width: 200px;
}
.summary-box span { display: block; font-size: 9px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
.summary-box strong { font-size: 14px; font-weight: 900; }
.summary-box.highlight { background: #000; color: #fff; }
.summary-box.highlight span { color: #ccc; }`;
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
    case DocumentType.EPF_FORM:
      return getStatutoryFormCss();
    case DocumentType.ETF_FORM:
      return getStatutoryFormCss();
    default:
      return '';
  }
}
