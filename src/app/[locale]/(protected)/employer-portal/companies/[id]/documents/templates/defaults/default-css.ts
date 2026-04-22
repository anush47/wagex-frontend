import { DocumentType } from '@/types/template';

export function getGeneralPrintCss(): string {
  return `
/* --- GLOBAL PAGINATION SYSTEM --- */
* { box-sizing: border-box; margin: 0; padding: 0; }
.paginated-document { margin: 0; padding: 0; background: transparent; }
.report-page {
  position: relative;
  width: 100%;
  padding: 14mm 16mm 18mm;
  background: #fff;
  page-break-after: always;
  break-after: page;
  box-sizing: border-box;
}
.print-page-footer {
  position: absolute;
  bottom: 8mm;
  left: 16mm;
  right: 16mm;
  font-size: 7px;
  color: #888;
  text-align: right;
  border-top: 1px solid #ccc;
  padding-top: 4px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
@media print {
  @page { size: auto; margin: 0; }
  body { margin: 0; padding: 0; }
  .report-page {
    padding: 14mm 16mm 18mm !important;
    margin: 0 !important;
    page-break-after: always !important;
    break-after: page !important;
    overflow: hidden;
    box-shadow: none !important;
    border: none !important;
  }
  .print-page-footer { color: #555 !important; border-top: 1px solid #aaa !important; }
}
@media print and (orientation: landscape) { @page { size: landscape; } }
`;
}

/* ─── PAYSLIP (compact, 4 per A4 page in 2×2 grid) ─────────────────────── */
export function getPayslipCss(): string {
  return `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 8pt; color: #111; background: #fff; }

.slip {
  width: 100%;
  border: 1px solid #999;
  background: #fff;
  padding: 5mm 5mm 3mm;
  font-family: Arial, sans-serif;
  page-break-inside: avoid;
}

/* Header */
.slip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #111;
  padding-bottom: 5px;
  margin-bottom: 5px;
  gap: 8px;
}
.company-block { display: flex; gap: 6px; align-items: flex-start; }
.co-logo { width: 28px; height: 28px; object-fit: contain; flex-shrink: 0; }
.co-name { font-size: 9pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3px; line-height: 1.1; color: #111; }
.co-address { font-size: 6pt; color: #555; margin-top: 2px; max-width: 160px; }
.slip-meta { text-align: right; flex-shrink: 0; }
.slip-title { font-size: 10pt; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #111; }
.slip-period { font-size: 6.5pt; color: #444; margin-top: 1px; }

/* Employee row */
.emp-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 4px;
  margin-bottom: 5px;
}
.emp-field { display: flex; flex-direction: column; min-width: 90px; padding: 1px 0; }
.f-lbl { font-size: 5.5pt; text-transform: uppercase; color: #777; letter-spacing: 0.3px; }
.f-val { font-size: 7.5pt; color: #111; font-weight: 600; margin-top: 1px; }

/* Body: earnings / deductions */
.body-grid { display: flex; gap: 6px; margin-bottom: 4px; }
.col { flex: 1; min-width: 0; }
.col-head {
  font-size: 6pt;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 2px 4px;
  margin-bottom: 2px;
  background: #eee;
  color: #111;
}
.earn-head { border-left: 3px solid #111; }
.deduct-head { border-left: 3px solid #555; }
.row { display: flex; justify-content: space-between; padding: 1.5px 4px; font-size: 7pt; border-bottom: 1px dotted #ddd; }
.row span:last-child { text-align: right; min-width: 52px; font-variant-numeric: tabular-nums; }
.row.subtotal {
  font-weight: 700;
  background: #f0f0f0;
  border-top: 1px solid #999 !important;
  border-bottom: none !important;
  padding: 2px 4px;
  margin-top: 2px;
}

/* Statutory row */
.statutory-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 5px;
  background: #f5f5f5;
  border: 1px solid #ccc;
  font-size: 6pt;
  margin-bottom: 3px;
  flex-wrap: wrap;
}
.s-lbl { color: #333; font-weight: 700; }
.s-val { color: #111; font-weight: 800; }
.s-sep { color: #999; }
.s-note { color: #666; font-style: italic; }

/* Net pay */
.net-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #111;
  color: #fff;
  padding: 5px 8px;
  margin-bottom: 3px;
}
.net-label { font-size: 7pt; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
.net-amount { font-size: 11pt; font-weight: 900; letter-spacing: 0.5px; }

/* Footer note */
.slip-note { font-size: 5.5pt; color: #888; text-align: center; border-top: 1px dashed #ccc; padding-top: 2px; }
`;
}

/* ─── SALARY SHEET ───────────────────────────────────────────────────────── */
export function getSalarySheetCss(): string {
  return `${getGeneralPrintCss()}
/* --- SALARY SHEET --- */
.header { margin-bottom: 14px; border-bottom: 2.5px solid #000; padding-bottom: 10px; }
.header-logo { display: flex; align-items: flex-start; gap: 14px; }
.company-logo { height: 44px; width: auto; max-width: 140px; object-fit: contain; }
.header h1 { margin: 0; font-size: 16px; font-weight: 950; line-height: 1.1; }
.header h2 { margin: 3px 0 0; font-size: 11px; font-weight: 800; color: #333; text-transform: uppercase; letter-spacing: 0.04em; }
.header p { margin: 4px 0 0; font-size: 10px; font-weight: 600; color: #555; }
.sheet-table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
.sheet-table th { background: #111; color: #fff; padding: 6px 4px; font-size: 7px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.03em; border: 1px solid #333; text-align: right; }
.sheet-table th:first-child, .sheet-table th:nth-child(2), .sheet-table th:nth-child(3) { text-align: center; }
.sheet-table td { border: 1px solid #ddd; padding: 5px 4px; text-align: right; }
.sheet-table tbody tr:nth-child(even) { background: #f8f8f8; }
.sheet-table td.name-cell { text-align: left; font-weight: 700; }
.sheet-table td.center { text-align: center; }
.net-col { background: #eee !important; font-weight: 900 !important; }
.totals-row td { background: #111 !important; color: #fff !important; font-weight: 900; border: 1px solid #333 !important; }
`;
}

/* ─── ATTENDANCE REPORT ──────────────────────────────────────────────────── */
export function getAttendanceReportCss(): string {
  return `${getGeneralPrintCss()}
/* --- ATTENDANCE REPORT --- */
.att-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 8px; }
.hdr-left { display: flex; align-items: flex-start; gap: 10px; }
.company-logo { height: 38px; object-fit: contain; }
.co-name { font-size: 14px; font-weight: 950; text-transform: uppercase; line-height: 1.1; color: #111; }
.co-addr { font-size: 8px; color: #555; margin-top: 2px; max-width: 200px; }
.hdr-right { text-align: right; }
.rpt-title { font-size: 13px; font-weight: 950; letter-spacing: 1.5px; text-transform: uppercase; color: #111; }
.rpt-period { font-size: 8px; color: #444; margin-top: 2px; }

.emp-box { display: flex; flex-wrap: wrap; gap: 0; background: #f8f8f8; border: 1px solid #ccc; padding: 6px 10px; margin-bottom: 8px; }
.emp-f { display: flex; flex-direction: column; padding: 3px 14px 3px 0; min-width: 120px; }
.e-lbl { font-size: 6px; text-transform: uppercase; color: #777; }
.e-val { font-size: 9px; color: #111; font-weight: 700; margin-top: 1px; }

/* Summary cards — all B&W */
.sum-strip { display: flex; gap: 4px; margin-bottom: 8px; }
.s-card { flex: 1; text-align: center; padding: 6px 4px; background: #f0f0f0; border: 1px solid #ccc; }
.s-num { font-size: 15px; font-weight: 950; line-height: 1.1; color: #111; }
.s-txt { font-size: 6px; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px; color: #444; }
.card-present { border-top: 3px solid #111; }
.card-absent  { border-top: 3px solid #555; background: #ebebeb; }
.card-late    { border-top: 3px solid #777; }
.card-leave   { border-top: 3px solid #333; background: #f5f5f5; }
.card-ot      { border-top: 3px solid #888; }
.card-total   { border-top: 3px solid #aaa; background: #e8e8e8; }

/* Daily log table */
.att-table { width: 100%; border-collapse: collapse; font-size: 7.5px; margin-bottom: 8px; }
.att-table thead tr { background: #111; color: #fff; }
.att-table th { padding: 5px 3px; font-size: 6.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; border: 1px solid #333; text-align: center; line-height: 1.3; }
.att-table td { padding: 3.5px 3px; border: 1px solid #ddd; text-align: center; vertical-align: middle; }
.att-table tbody tr:nth-child(even) { background: #fafafa; }
.att-table tbody tr.row-leave  { background: #efefef; }
.att-table tbody tr.row-late   { background: #e8e8e8; }
.att-table tbody tr.row-absent { background: #e0e0e0; }
.att-table .c-name  { text-align: left; font-weight: 700; }
.att-table .c-wide  { min-width: 80px; }
.att-table .c-num   { font-variant-numeric: tabular-nums; }
.att-table .late-flag { color: #111; font-weight: 900; text-decoration: underline; }

/* Status badges — B&W */
.badge { display: inline-block; padding: 1px 5px; font-size: 6px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.4px; border: 1px solid #999; }
.badge-present { background: #fff; color: #111; }
.badge-absent  { background: #333; color: #fff; border-color: #333; }
.badge-leave   { background: #888; color: #fff; border-color: #888; }
.badge-half    { background: #eee; color: #111; border-style: dashed; }
.badge-holiday { background: #555; color: #fff; border-color: #555; }

/* Leave breakdown */
.leave-section { margin-bottom: 10px; }
.section-title { font-size: 7px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; background: #eee; padding: 3px 8px; margin-bottom: 4px; border-left: 3px solid #111; color: #111; }
.leave-table { width: 100%; border-collapse: collapse; font-size: 8px; }
.leave-table th { background: #333; color: #fff; padding: 4px 6px; text-align: left; border: 1px solid #222; font-size: 7px; }
.leave-table td { padding: 3px 6px; border: 1px solid #ddd; }
.leave-table tbody tr:nth-child(even) { background: #f5f5f5; }

/* Signatures */
.sig-row { display: flex; gap: 40px; margin-top: 10px; }
.sig-block { flex: 1; }
.sig-line { border-bottom: 1px solid #333; height: 32px; margin-bottom: 3px; }
.sig-label { font-size: 7.5px; font-weight: 700; color: #111; }
.sig-sub { font-size: 7px; color: #666; margin-top: 3px; }
`;
}

/* ─── EPF FORM C (R-4) — black & white ──────────────────────────────────── */
export function getEpfFormCss(): string {
  return `${getGeneralPrintCss()}
/* --- EPF FORM C (R-4) --- */
.report-page { padding: 10mm 14mm 18mm; }

.form-header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 8px; }
.fh-left { display: flex; align-items: flex-start; gap: 8px; }
.company-logo { height: 36px; object-fit: contain; }
.co-name { font-size: 12px; font-weight: 950; text-transform: uppercase; line-height: 1.1; color: #111; }
.co-meta { font-size: 7.5px; color: #444; margin-top: 2px; }
.fh-center { flex: 1; text-align: center; padding: 0 10px; }
.form-badge { font-size: 6.5px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; background: #111; color: #fff; padding: 2px 8px; display: inline-block; margin-bottom: 3px; }
.form-title { font-size: 14px; font-weight: 950; letter-spacing: 2px; text-transform: uppercase; line-height: 1.1; color: #111; }
.form-sub { font-size: 8px; color: #333; margin-top: 2px; }
.fh-right { text-align: right; min-width: 90px; }
.ref-box { border: 1px solid #777; padding: 4px 8px; }
.ref-lbl { font-size: 6px; text-transform: uppercase; color: #666; }
.ref-val { font-size: 8.5px; font-weight: 900; color: #111; }

.info-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 8px; border: 1px solid #bbb; }
.info-table td { padding: 4px 6px; border: 1px solid #ccc; vertical-align: top; }
.i-lbl { background: #eee; font-weight: 700; color: #111; width: 18%; white-space: nowrap; }
.i-val { width: 32%; color: #111; }

.rate-bar { background: #f0f0f0; border: 1px solid #bbb; padding: 4px 10px; font-size: 7.5px; text-align: center; margin-bottom: 8px; color: #111; font-weight: 600; }

.form-table { width: 100%; border-collapse: collapse; font-size: 8px; margin-bottom: 6px; }
.form-table thead tr { background: #111; color: #fff; }
.form-table th { padding: 5px 4px; font-size: 7px; font-weight: 900; text-transform: uppercase; border: 1px solid #333; text-align: right; line-height: 1.3; letter-spacing: 0.03em; }
.form-table th.t-left { text-align: left; }
.form-table th.t-center { text-align: center; }
.form-table td { padding: 3.5px 4px; border: 1px solid #ddd; font-size: 8px; vertical-align: middle; color: #111; }
.form-table td.t-right { text-align: right; font-variant-numeric: tabular-nums; }
.form-table td.t-center { text-align: center; }
.form-table td.t-total { text-align: right; font-weight: 900; font-variant-numeric: tabular-nums; color: #111; }
.form-table td.t-left { text-align: left; }
.form-table tbody tr:nth-child(even) { background: #f8f8f8; }
.totals-row { background: #111 !important; color: #fff !important; }
.totals-row td { font-weight: 900; font-size: 8.5px; border-color: #333 !important; color: #fff !important; }
.totals-label { text-align: right !important; padding-right: 8px; letter-spacing: 0.05em; }

.payable-bar { display: flex; justify-content: flex-end; align-items: center; gap: 20px; padding: 6px 8px; border-top: 2px solid #111; border-bottom: 2px solid #111; margin-bottom: 10px; }
.payable-label { font-size: 8.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #111; }
.payable-amount { font-size: 13px; font-weight: 950; color: #111; }

.surcharge-row { display: flex; justify-content: flex-end; gap: 16px; padding: 3px 8px; font-size: 8px; border-bottom: 1px dashed #bbb; margin-bottom: 4px; color: #111; }

.declaration { margin-top: 6px; }
.declaration-text { font-size: 7.5px; color: #333; line-height: 1.5; border: 1px dashed #bbb; padding: 5px 8px; background: #fafafa; margin-bottom: 10px; }
.sig-grid { display: flex; gap: 30px; }
.sig-block { flex: 1; }
.sig-line { border-bottom: 1px solid #333; height: 36px; margin-bottom: 3px; }
.sig-name { font-size: 7.5px; font-weight: 700; color: #111; }
.sig-date { font-size: 7px; color: #555; margin-top: 3px; }
.stamp-block { max-width: 140px; }
.stamp-lbl { font-size: 7.5px; font-weight: 700; margin-bottom: 3px; color: #111; }
.stamp-box { border: 1px solid #999; height: 55px; width: 110px; }

.form-footer { font-size: 6.5px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 3px; margin-top: 8px; }
`;
}

/* ─── ETF FORM C (R-4) — black & white, same structure as EPF ───────────── */
export function getEtfFormCss(): string {
  return getEpfFormCss();
}

export function getStatutoryFormCss(): string {
  return getEpfFormCss();
}

export function getDefaultCss(type?: DocumentType): string {
  if (!type) return getPayslipCss();
  switch (type) {
    case DocumentType.PAYSLIP:           return getPayslipCss();
    case DocumentType.SALARY_SHEET:      return getSalarySheetCss();
    case DocumentType.ATTENDANCE_REPORT: return getAttendanceReportCss();
    case DocumentType.EPF_FORM:          return getEpfFormCss();
    case DocumentType.ETF_FORM:          return getEtfFormCss();
    default:                             return '';
  }
}
