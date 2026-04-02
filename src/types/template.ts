export enum DocumentType {
  PAYSLIP = 'PAYSLIP',
  SALARY_SHEET = 'SALARY_SHEET',
  ATTENDANCE_REPORT = 'ATTENDANCE_REPORT',
  EPF_FORM = 'EPF_FORM',
  ETF_FORM = 'ETF_FORM',
}

export enum TemplateStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface DocumentTemplate {
  id: string;
  companyId?: string | null;
  name: string;
  description?: string | null;
  type: DocumentType;
  html: string;
  css?: string | null;
  helpers?: string | null;
  config?: any;
  isActive: boolean;
  isDefault: boolean;
  status: TemplateStatus;
  createdAt: string;
  updatedAt: string;
}
