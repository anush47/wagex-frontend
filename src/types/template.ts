export enum DocumentType {
  PAYSLIP = 'PAYSLIP',
  SALARY_SHEET = 'SALARY_SHEET',
  ATTENDANCE_REPORT = 'ATTENDANCE_REPORT',
  EPF_FORM = 'EPF_FORM',
  ETF_FORM = 'ETF_FORM',
}

export interface DocumentTemplate {
  id: string;
  companyId?: string | null;
  name: string;
  description?: string | null;
  type: DocumentType;
  html: string;
  css?: string | null;
  config?: any;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
