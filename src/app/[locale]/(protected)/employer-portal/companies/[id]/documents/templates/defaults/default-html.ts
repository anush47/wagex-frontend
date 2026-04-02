import { DocumentType } from '@/types/template';

export function getPayslipHtml(): string {
  return `<div class="payslip">
  <div class="header">
    <div class="company-info">
      <h1>{{company.name}}</h1>
      <p>{{company.address}}</p>
    </div>
    <div class="doc-title">
      <h2>PAY SLIP</h2>
      <p>{{month}}/{{year}}</p>
    </div>
  </div>

  <div class="employee-info">
    <div class="info-group">
      <span class="label">Employee No.</span><span class="value">{{employee.employeeNo}}</span>
      <span class="label">Name</span><span class="value">{{employee.fullName}}</span>
      <span class="label">NIC</span><span class="value">{{employee.nic}}</span>
      <span class="label">Designation</span><span class="value">{{employee.designation}}</span>
      <span class="label">Department</span><span class="value">{{employee.department.name}}</span>
      <span class="label">Employment Type</span><span class="value">{{employee.employmentType}}</span>
    </div>
    <div class="info-group">
      <span class="label">Pay Period</span><span class="value">{{periodStartDate}} to {{periodEndDate}}</span>
      <span class="label">Pay Date</span><span class="value">{{payDate}}</span>
      <span class="label">Bank</span><span class="value">{{employee.details.bankName}}</span>
      <span class="label">Account No.</span><span class="value">{{employee.details.accountNumber}}</span>
    </div>
  </div>

  <div class="salary-details">
    <div class="earnings">
      <h3>Earnings</h3>
      <table class="salary-table">
        <tr><td>Basic Salary</td><td>{{formatCurrency basicSalary}}</td></tr>
        {{#each additions}}
        <tr><td>{{this.name}}</td><td>{{formatCurrency this.amount}}</td></tr>
        {{/each}}
      </table>
    </div>
    <div class="deductions">
      <h3>Deductions</h3>
      <table class="salary-table">
        {{#each deductions}}
        <tr><td>{{this.name}}</td><td>{{formatCurrency this.amount}}</td></tr>
        {{/each}}
        {{#if noPayAmount}}<tr><td>No Pay</td><td>{{formatCurrency noPayAmount}}</td></tr>{{/if}}
        {{#if lateDeduction}}<tr><td>Late Deduction</td><td>{{formatCurrency lateDeduction}}</td></tr>{{/if}}
        {{#if advanceDeduction}}<tr><td>Advance Recovery</td><td>{{formatCurrency advanceDeduction}}</td></tr>{{/if}}
      </table>
    </div>
  </div>

  <div class="net-pay-box">
    <span class="label">NET PAY</span>
    <span class="amount">{{formatCurrency netSalary}}</span>
  </div>

  <div class="statutory-info">
    EPF (Employee): {{formatCurrency epfEmployee}} | EPF (Employer): {{formatCurrency epfEmployer}} | ETF (Employer): {{formatCurrency etfEmployer}}
  </div>

  <div class="signatures">
    <div class="sig">Prepared By</div>
    <div class="sig">Approved By</div>
    <div class="sig">Employee Signature</div>
  </div>
</div>`;
}

export function getSalarySheetHtml(): string {
  return `<div class="salary-sheet">
  <div class="header">
    <h1>{{company.name}}</h1>
    <h2>Salary Sheet — {{month}}/{{year}}</h2>
    <p>Period: {{periodStartDate}} to {{periodEndDate}}</p>
  </div>

  <table class="sheet-table">
    <thead>
      <tr>
        <th style="width:40px">#</th>
        <th style="width:100px">Emp No</th>
        <th style="min-width:130px;text-align:left">Name</th>
        <th>Basic</th>
        <th>OT</th>
        <th>Hol. Pay</th>
        {{#each additionColumns}}<th>{{this}}</th>{{/each}}
        <th>No Pay</th>
        {{#each deductionColumns}}<th>{{this}}</th>{{/each}}
        <th>EPF(E)</th>
        <th class="net-col">Net Pay</th>
      </tr>
    </thead>
    <tbody>
      {{#each salaries as |row idx|}}
      <tr class="employee-row">
        <td>{{add idx 1}}</td>
        <td>{{row.employee.employeeNo}}</td>
        <td class="name-cell">{{row.employee.fullName}}</td>
        <td>{{formatCurrency row.basicSalary}}</td>
        <td>{{formatCurrency row.otAmount}}</td>
        <td>{{formatCurrency row.holidayPayAmount}}</td>
        {{#each ../additionColumns as |col|}}<td>{{formatCurrency (getCustomTotal row.additionAmounts col)}}</td>{{/each}}
        <td>{{formatCurrency row.noPayAmount}}</td>
        {{#each ../deductionColumns as |col|}}<td>{{formatCurrency (getCustomTotal row.deductionAmounts col)}}</td>{{/each}}
        <td>{{formatCurrency row.epfEmployee}}</td>
        <td class="net-col">{{formatCurrency row.netSalary}}</td>
      </tr>
      {{/each}}
    </tbody>
    <tfoot>
      <tr class="totals-row">
        <td colspan="3">TOTAL</td>
        <td>{{formatCurrency totals.basicSalary}}</td>
        <td>{{formatCurrency totals.otAmount}}</td>
        <td>{{formatCurrency totals.holidayPayAmount}}</td>
        {{#each additionColumns as |col|}}<td>{{formatCurrency (getCustomTotal totals.additionAmounts col)}}</td>{{/each}}
        <td>{{formatCurrency totals.noPayAmount}}</td>
        {{#each deductionColumns as |col|}}<td>{{formatCurrency (getCustomTotal totals.deductionAmounts col)}}</td>{{/each}}
        <td>{{formatCurrency totals.epfEmployee}}</td>
        <td class="net-col">{{formatCurrency totals.netSalary}}</td>
      </tr>
    </tfoot>
  </table>
</div>`;
}

export function getAttendanceReportHtml(): string {
  return `<div class="attendance-report">
  <div class="header">
    <h1>{{company.name}}</h1>
    <h2>Attendance Report — {{month}}/{{year}}</h2>
  </div>

  <div class="employee-info">
    <span>Employee: <strong>{{employee.fullName}}</strong></span>
    <span>Emp No: {{employee.employeeNo}}</span>
    <span>Designation: {{employee.designation}}</span>
  </div>

  <table class="att-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Day Type</th>
        <th>Check In</th>
        <th>Check Out</th>
        <th>Work Hrs</th>
        <th>OT Mins</th>
        <th>Late</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {{#each logs}}
      <tr>
        <td>{{this.date}}</td>
        <td>{{this.workDayStatus}}</td>
        <td>{{this.checkInTime}}</td>
        <td>{{this.checkOutTime}}</td>
        <td>{{this.workMinutes}}</td>
        <td>{{this.overtimeMinutes}}</td>
        <td>{{#if this.isLate}}{{this.lateMinutes}}m{{else}}-{{/if}}</td>
        <td>{{this.inApprovalStatus}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-item"><span>Total Days</span><strong>{{summary.totalDays}}</strong></div>
    <div class="summary-item"><span>Working Days</span><strong>{{summary.workingDays}}</strong></div>
    <div class="summary-item"><span>Present</span><strong>{{summary.presentDays}}</strong></div>
    <div class="summary-item"><span>Absent</span><strong>{{summary.absentDays}}</strong></div>
    <div class="summary-item"><span>Late Days</span><strong>{{summary.lateDays}}</strong></div>
    <div class="summary-item"><span>OT (mins)</span><strong>{{summary.overtimeMinutes}}</strong></div>
  </div>
</div>`;
}

export function getDefaultHtml(type: DocumentType): string {
  switch (type) {
    case DocumentType.PAYSLIP:
      return getPayslipHtml();
    case DocumentType.SALARY_SHEET:
      return getSalarySheetHtml();
    case DocumentType.ATTENDANCE_REPORT:
      return getAttendanceReportHtml();
    default:
      return '<div class="template"><h1>{{company.name}}</h1></div>';
  }
}
