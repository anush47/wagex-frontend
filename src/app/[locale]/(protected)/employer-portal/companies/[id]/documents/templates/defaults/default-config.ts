import { DocumentType } from '@/types/template';

export function getPayslipConfig() {
  return {
    paperSize: 'A4',
    orientation: 'portrait',
    perPage: 1,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  };
}

export function getSalarySheetConfig() {
  return {
    paperSize: 'A4',
    orientation: 'landscape',
    perPage: 1,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  };
}

export function getAttendanceReportConfig() {
  return {
    paperSize: 'A4',
    orientation: 'portrait',
    perPage: 1,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  };
}

export function getDefaultConfig(type?: DocumentType) {
  if (!type) return getPayslipConfig();
  
  switch (type) {
    case DocumentType.PAYSLIP:
      return getPayslipConfig();
    case DocumentType.SALARY_SHEET:
      return getSalarySheetConfig();
    case DocumentType.ATTENDANCE_REPORT:
      return getAttendanceReportConfig();
    default:
      return getPayslipConfig();
  }
}
