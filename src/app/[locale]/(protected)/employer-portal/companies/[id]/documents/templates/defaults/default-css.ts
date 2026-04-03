import { DocumentType } from '@/types/template';

export function getGeneralPrintCss(): string {
  return `
/* --- GLOBAL PAGINATION SYSTEM --- */
.paginated-document {
  margin: 0;
  padding: 0;
  background: transparent;
}
.report-page {
  position: relative;
  width: 100%;
  padding: 20mm 15mm;
  background: #fff;
  page-break-after: always;
  box-sizing: border-box;
  min-height: 297mm; /* Full A4 height to force footer to bottom */
}
.print-page-footer {
  position: absolute;
  bottom: 10mm;
  left: 15mm;
  right: 15mm;
  font-size: 8px;
  color: #ccc;
  text-align: right;
  border-top: 1px solid #eee;
  padding-top: 5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

@media print {
  @page {
    size: auto;
    margin: 0;
  }
  body {
    margin: 0;
    padding: 0;
  }
  .report-page {
    padding: 20mm 15mm !important;
    margin: 0 !important;
    width: 210mm !important;
    height: 297mm !important;
    page-break-after: always !important;
    overflow: hidden;
    position: relative;
    box-shadow: none !important;
    border: none !important;
  }
  .report-page.landscape {
    width: 297mm !important;
    height: 210mm !important;
  }
  .print-page-footer {
    display: block !important;
    color: #444 !important; /* Higher contrast for print */
    border-top: 1.5px solid #000 !important;
  }
}
@media print and (orientation: landscape) {
  @page { size: landscape; }
}
`;
}

export function getPayslipCss(): string {
  return `/* --- PAYSLIP --- */
.payslip { padding: 24px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #111; background: #fff; max-width: 800px; margin: 0 auto; }
.payslip .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; }
.payslip .logo-section { display: flex; align-items: flex-start; gap: 12px; }
.payslip .company-logo { height: 40px; width: auto; object-fit: contain; }
.payslip .header h1 { margin: 0; font-size: 18px; font-weight: 950; }
.payslip .header p { margin: 0; font-size: 11px; color: #666; font-weight: 600; }
.payslip .doc-title-section { display: flex; align-items: center; gap: 16px; }
.payslip .doc-title { text-align: right; }
.payslip .employee-photo { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 1px solid #ddd; }
.payslip .employee-info { display: flex; gap: 40px; margin-bottom: 20px; font-size: 11px; }
.payslip .info-group { flex: 1; display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; }
.payslip .label { color: #888; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.payslip .value { color: #000; font-weight: 800; }
.payslip .salary-details { display: flex; gap: 24px; margin-bottom: 20px; }
.payslip .earnings, .payslip .deductions { flex: 1; }
.salary-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.salary-table td { padding: 6px 0; border-bottom: 1px solid #f2f2f2; }
.salary-table td:last-child { text-align: right; font-weight: 800; }
.net-pay-box { background: #000; color: #fff; padding: 18px 24px; text-align: center; margin: 16px 0; display: flex; align-items: center; justify-content: space-between; }
.net-pay-box .label { font-size: 10px; font-weight: 900; letter-spacing: 0.2em; }
.net-pay-box .amount { font-size: 24px; font-weight: 900; }
.statutory-info { font-size: 9px; color: #888; text-align: center; margin: 12px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.signatures { display: flex; justify-content: space-between; margin-top: 48px; }
.sig { border-top: 1px solid #000; width: 160px; text-align: center; padding-top: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; }`;
}

export function getSalarySheetCss(): string {
  return `${getGeneralPrintCss()}
/* --- SALARY SHEET --- */
.report-page.landscape { width: 297mm; height: 210mm; padding: 10mm 15mm; }
@media print { .report-page { width: 297mm; height: 209mm; } .report-page.landscape { width: 297mm; } }

.header { margin-bottom: 16px; border-bottom: 2px solid #000; padding-bottom: 8px; }
.header-logo { display: flex; align-items: center; gap: 16px; }
.company-logo { height: 32px; width: auto; object-fit: contain; }
.header h1 { margin: 0; font-size: 16px; font-weight: 950; }
.header h2 { margin: 0; font-size: 12px; font-weight: 800; color: #444; text-transform: uppercase; letter-spacing: 0.1em; }
.sheet-table { width: 100%; border-collapse: collapse; font-size: 10px; }
.sheet-table th, .sheet-table td { border: 1px solid #ddd; padding: 6px 4px; text-align: right; }
.sheet-table th { background: #000; color: #fff; font-weight: 900; font-size: 8px; text-transform: uppercase; border: 1px solid #333; }
.sheet-table td.name-cell { text-align: left; font-weight: 700; width: 130px; }
.net-col { background: #f8f8f8; font-weight: 900; }
.totals-row td { background: #000 !important; color: #fff !important; font-weight: 900; border: 1px solid #333; }`;
}

export function getAttendanceReportCss(): string {
  return `${getGeneralPrintCss()}
/* --- ATTENDANCE REPORT --- */
.header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 14px; }
.logo-section { display: flex; align-items: center; gap: 16px; }
.company-logo { height: 36px; width: auto; object-fit: contain; }
.header h1 { margin: 0; font-size: 16px; font-weight: 950; }
.header h2 { margin: 0; font-size: 11px; font-weight: 800; color: #555; text-transform: uppercase; }
.att-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
.att-table th { background: #000; color: #fff; padding: 10px 8px; text-transform: uppercase; border: 1px solid #333; }
.att-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
.summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
.summary-item { border: 1px solid #000; padding: 10px; text-align: center; }
.summary-item span { display: block; font-size: 8px; font-weight: 900; text-transform: uppercase; color: #888; }
.summary-item strong { font-size: 16px; font-weight: 950; }`;
}

export function getStatutoryFormCss(): string {
  return `${getGeneralPrintCss()}
/* --- STATUTORY FORM --- */
.report-page.statutory-form { padding: 15mm 20mm; }
.form-letterhead { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 14px; }
.form-company { font-size: 14px; font-weight: 950; text-transform: uppercase; }
.form-company-meta { font-size: 9px; font-weight: 700; color: #666; margin-top: 2px; }
.form-title-row { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: baseline; }
.form-title { font-size: 13px; font-weight: 950; letter-spacing: 0.1em; }
.form-period { font-size: 10px; font-weight: 800; color: #888; }
.form-table { width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #000; }
.form-table th { background: #000; color: #fff; padding: 10px 8px; font-size: 8px; text-transform: uppercase; text-align: right; border: 1px solid #333; }
.form-table th.name-cell { text-align: left; }
.form-table td { padding: 8px; text-align: right; border: 1px solid #000; }
.td-num { text-align: center !important; color: #999; width: 30px; }
.name-cell { text-align: left !important; font-weight: 800; }
.bold { font-weight: 950; }
.totals-row td { background: #f2f2f2; color: #000; font-weight: 950; }
.form-summary { margin-top: 20px; display: flex; justify-content: flex-end; gap: 15px; }
.summary-box { border: 1.5px solid #000; padding: 12px 20px; text-align: right; min-width: 180px; }
.summary-box span { display: block; font-size: 8px; font-weight: 900; text-transform: uppercase; color: #777; margin-bottom: 4px; }
.summary-box strong { font-size: 15px; font-weight: 950; }
.summary-box.highlight { background: #000; color: #fff; }
.summary-box.highlight span { color: #bbb; }`;
}

export function getDefaultCss(type?: DocumentType): string {
  if (!type) return getPayslipCss();
  switch (type) {
    case DocumentType.PAYSLIP: return getPayslipCss();
    case DocumentType.SALARY_SHEET: return getSalarySheetCss();
    case DocumentType.ATTENDANCE_REPORT: return getAttendanceReportCss();
    case DocumentType.EPF_FORM: return getStatutoryFormCss();
    case DocumentType.ETF_FORM: return getStatutoryFormCss();
    default: return '';
  }
}
