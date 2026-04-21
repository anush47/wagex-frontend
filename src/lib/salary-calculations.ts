import { SalaryComponentResult } from "@/types/salary";

export interface SalaryComputeParams {
  basicSalary: number;
  components: SalaryComponentResult[];
  /** Absences + unpaid leave deductions (NOT late — late is inside components) */
  noPayAmount: number;
  taxAmount: number;
  advanceDeduction: number;
  otAdjustment: number;
  holidayPayAdjustment: number;
  /** Manual late override — auto late is already inside components as LATE_DEDUCTION */
  lateAdjustment: number;
  recoveryAdjustment: number;
}

export interface SalaryTotals {
  grossEarnings: number;
  totalAdditions: number;
  totalDeductions: number;
  totalRecoveries: number;
  netSalary: number;
  additions: SalaryComponentResult[];
  deductions: SalaryComponentResult[];
}

/**
 * Single source of truth for salary totals displayed across all salary views.
 *
 * Formula mirrors salary-engine.service.ts exactly:
 *   grossEarnings  = basic + additions + otAdjustment + holidayPayAdjustment
 *   totalRecoveries = noPayAmount + componentDeductions + advanceDeduction
 *                     + taxAmount + recoveryAdjustment + lateAdjustment
 *   netSalary      = grossEarnings - totalRecoveries
 *
 * IMPORTANT: `lateDeduction` (auto-calculated) is already included in
 * `components` as a LATE_DEDUCTION entry — do NOT add it separately.
 * `lateAdjustment` is the manual override and IS added separately.
 */
export function computeSalaryTotals(params: SalaryComputeParams): SalaryTotals {
  const {
    basicSalary,
    components,
    noPayAmount,
    taxAmount,
    advanceDeduction,
    otAdjustment,
    holidayPayAdjustment,
    lateAdjustment,
    recoveryAdjustment,
  } = params;

  const additions = components.filter((c) => c.category === "ADDITION");
  const deductions = components.filter((c) => c.category === "DEDUCTION");

  const totalAdditions = additions.reduce((s, c) => s + (c.amount || 0), 0);
  const totalDeductions = deductions.reduce((s, c) => s + (c.amount || 0), 0);

  const grossEarnings =
    (basicSalary || 0) +
    totalAdditions +
    (otAdjustment || 0) +
    (holidayPayAdjustment || 0);

  const totalRecoveries =
    (noPayAmount || 0) +
    totalDeductions +
    (advanceDeduction || 0) +
    (taxAmount || 0) +
    (recoveryAdjustment || 0) +
    (lateAdjustment || 0);

  const netSalary = grossEarnings - totalRecoveries;

  return {
    grossEarnings,
    totalAdditions,
    totalDeductions,
    totalRecoveries,
    netSalary,
    additions,
    deductions,
  };
}
