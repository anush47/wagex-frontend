import { PaymentMethod } from './salary';

export interface EpfRecord {
  id: string;
  companyId: string;
  month: number;
  year: number;
  referenceNo?: string;
  totalContribution: number;
  surcharge: number;
  paidDate?: string;
  slipUrl?: string;
  paymentMethod?: PaymentMethod;
  bankName?: string;
  bankBranch?: string;
  bankCode?: string;
  branchCode?: string;
  chequeNo?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EtfRecord {
  id: string;
  companyId: string;
  month: number;
  year: number;
  totalContribution: number;
  surcharge: number;
  paidDate?: string;
  slipUrl?: string;
  paymentMethod?: PaymentMethod;
  bankName?: string;
  bankBranch?: string;
  bankCode?: string;
  branchCode?: string;
  chequeNo?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EpfQuery {
  page?: number;
  limit?: number;
  companyId?: string;
  month?: number;
  year?: number;
}

export interface EtfQuery {
  page?: number;
  limit?: number;
  companyId?: string;
  month?: number;
  year?: number;
}

export interface EpfPreviewItem {
  salaryId: string;
  employeeName: string;
  employeeNo: number;
  liableEarnings: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
}

export interface EtfPreviewItem {
  salaryId: string;
  employeeName: string;
  employeeNo: number;
  liableEarnings: number;
  employerContribution: number;
  totalContribution: number;
}

export interface EpfPreview {
  month: number;
  year: number;
  referenceNo?: string;
  items: EpfPreviewItem[];
  totalContribution: number;
}

export interface EtfPreview {
  month: number;
  year: number;
  items: EtfPreviewItem[];
  totalContribution: number;
}
