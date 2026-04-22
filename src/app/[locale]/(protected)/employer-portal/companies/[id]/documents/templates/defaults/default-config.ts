import { DocumentType } from '@/types/template';

export function getPayslipConfig() {
  return {
    paperSize: 'A4',
    orientation: 'portrait',
    perPage: 4,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
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

export function getEpfFormConfig() {
  return {
    paperSize: 'A4',
    orientation: 'landscape',
    perPage: 1,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 15,
    marginRight: 15,
  };
}

export function getEtfFormConfig() {
  return {
    paperSize: 'A4',
    orientation: 'landscape',
    perPage: 1,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 15,
    marginRight: 15,
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
    case DocumentType.EPF_FORM:
      return getEpfFormConfig();
    case DocumentType.ETF_FORM:
      return getEtfFormConfig();
    default:
      return getPayslipConfig();
  }
}
