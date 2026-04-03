import { DocumentType } from '@/types/template';

export function getPayslipHtml(): string {
  return `<div class="paginated-document">
  <div class="report-page">
    <div class="payslip">
      <div class="header">
        <div class="logo-section">
          {{#if company.logo}}<img src="{{company.logo}}" class="company-logo" alt="logo" />{{/if}}
          <div class="company-info">
            <h1>{{company.name}}</h1>
            <p>{{company.address}}</p>
          </div>
        </div>
        <div class="doc-title-section">
          <div class="doc-title">
            <h2>PAY SLIP</h2>
            <p>{{month}}/{{year}}</p>
          </div>
          {{#if employee.photo}}<img src="{{employee.photo}}" class="employee-photo" alt="profile" />{{/if}}
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
    </div>
    <div class="print-page-footer">Official Payslip</div>
  </div>
</div>`;
}

export function getSalarySheetHtml(): string {
  return `<div class="paginated-document">
  {{#each (chunk salaries 22)}}
  <div class="report-page landscape">
    <div class="header">
      <div class="header-logo">
        {{#if ../company.logo}}<img src="{{../company.logo}}" class="company-logo" alt="logo" />{{/if}}
        <div class="header-text">
          <h1>{{../company.name}}</h1>
          <h2>Salary Sheet — {{../month}}/{{../year}} (Page {{add @index 1}})</h2>
          <p>Period: {{../periodStartDate}} to {{../periodEndDate}}</p>
        </div>
      </div>
    </div>

    <table class="sheet-table">
      <thead>
        <tr>
          <th style="width:30px">#</th>
          <th style="width:60px">Emp No</th>
          <th style="min-width:120px;text-align:left">Name</th>
          <th>Basic</th>
          <th>OT</th>
          <th>Hol. Pay</th>
          {{#each ../additionColumns}}<th>{{this}}</th>{{/each}}
          <th>No Pay</th>
          {{#each ../deductionColumns}}<th>{{this}}</th>{{/each}}
          <th>EPF(E)</th>
          <th class="net-col">Net Pay</th>
        </tr>
      </thead>
      <tbody>
        {{#each this as |row idx|}}
        <tr class="employee-row">
          <td>{{add idx 1}}</td>
          <td>{{row.employee.employeeNo}}</td>
          <td class="name-cell">{{row.employee.fullName}}</td>
          <td>{{formatCurrency row.basicSalary}}</td>
          <td>{{formatCurrency row.otAmount}}</td>
          <td>{{formatCurrency row.holidayPayAmount}}</td>
          {{#each ../../additionColumns as |col|}}<td>{{formatCurrency (getCustomTotal row.additionAmounts col)}}</td>{{/each}}
          <td>{{formatCurrency row.noPayAmount}}</td>
          {{#each ../../deductionColumns as |col|}}<td>{{formatCurrency (getCustomTotal row.deductionAmounts col)}}</td>{{/each}}
          <td>{{formatCurrency row.epfEmployee}}</td>
          <td class="net-col">{{formatCurrency row.netSalary}}</td>
        </tr>
        {{/each}}
      </tbody>
      {{#if @last}}
      <tfoot>
        <tr class="totals-row">
          <td colspan="3">GRAND TOTAL</td>
          <td>{{formatCurrency ../totals.basicSalary}}</td>
          <td>{{formatCurrency ../totals.otAmount}}</td>
          <td>{{formatCurrency ../totals.holidayPayAmount}}</td>
          {{#each ../additionColumns as |col|}}<td>{{formatCurrency (getCustomTotal ../totals.additionAmounts col)}}</td>{{/each}}
          <td>{{formatCurrency ../totals.noPayAmount}}</td>
          {{#each ../deductionColumns as |col|}}<td>{{formatCurrency (getCustomTotal ../totals.deductionAmounts col)}}</td>{{/each}}
          <td>{{formatCurrency ../totals.epfEmployee}}</td>
          <td class="net-col">{{formatCurrency ../totals.netSalary}}</td>
        </tr>
      </tfoot>
      {{/if}}
    </table>

    <div class="print-page-footer">Page {{add @index 1}}</div>
  </div>
  {{/each}}
</div>`;
}

export function getAttendanceReportHtml(): string {
  return `<div class="paginated-document">
  {{#each (chunk logs 25)}}
  <div class="report-page">
    <div class="header">
      <div class="logo-section">
        {{#if ../company.logo}}<img src="{{../company.logo}}" class="company-logo" alt="logo" />{{/if}}
        <div class="company-text">
          <h1>{{../company.name}}</h1>
          <h2>Attendance Report — {{../month}}/{{../year}}</h2>
          <p>Employee: {{../employee.fullName}} ({{../employee.employeeNo}})</p>
        </div>
      </div>
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
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {{#each this}}
        <tr>
          <td>{{this.date}}</td>
          <td>{{this.workDayStatus}}</td>
          <td>{{this.checkInTime}}</td>
          <td>{{this.checkOutTime}}</td>
          <td>{{this.workMinutes}}</td>
          <td>{{this.overtimeMinutes}}</td>
          <td>{{this.inApprovalStatus}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    {{#if @last}}
    <div class="summary">
      <div class="summary-item"><span>Working</span><strong>{{../summary.workingDays}}</strong></div>
      <div class="summary-item"><span>Present</span><strong>{{../summary.presentDays}}</strong></div>
      <div class="summary-item"><span>Absent</span><strong>{{../summary.absentDays}}</strong></div>
      <div class="summary-item"><span>Late</span><strong>{{../summary.lateDays}}</strong></div>
      <div class="summary-item"><span>OT (mins)</span><strong>{{../summary.overtimeMinutes}}</strong></div>
    </div>
    {{/if}}

    <div class="print-page-footer">Page {{add @index 1}}</div>
  </div>
  {{/each}}
</div>`;
}

export function getEpfFormHtml(): string {
  return `<div class="paginated-document">
  {{#each (chunk salaries 22)}}
  <div class="report-page statutory-form">
    <div class="form-letterhead">
      <div class="form-company">{{../company.name}}</div>
      <div class="form-company-meta">{{../company.address}} &bull; Employer No: {{../company.employerNumber}}</div>
    </div>
  
    <div class="form-title-row">
      <span class="form-title">EPF CONTRIBUTION SCHEDULE</span>
      <span class="form-period">Page {{add @index 1}}</span>
    </div>

    <table class="form-table">
      <thead>
        <tr>
          <th>#</th>
          <th class="name-cell">EMPLOYEE NAME</th>
          <th>MEMBER NO</th>
          <th>GROSS EARNINGS</th>
          <th>EMPLOYEE (8%)</th>
          <th>EMPLOYER (12%)</th>
          <th>TOTAL</th>
        </tr>
      </thead>
      <tbody>
        {{#each this as |row idx|}}
        <tr>
          <td class="td-num">{{add idx 1}}</td>
          <td class="name-cell">{{row.employee.fullName}}</td>
          <td>{{row.employee.memberNo}}</td>
          <td>{{formatCurrency row.grossEarnings}}</td>
          <td>{{formatCurrency row.epfEmployee}}</td>
          <td>{{formatCurrency row.epfEmployer}}</td>
          <td class="bold">{{formatCurrency (add row.epfEmployee row.epfEmployer)}}</td>
        </tr>
        {{/each}}
      </tbody>
      {{#if @last}}
      <tfoot>
        <tr class="totals-row">
          <td colspan="3">SCHEDULE TOTALS</td>
          <td></td>
          <td>{{formatCurrency ../totals.totalEmployeeContribution}}</td>
          <td>{{formatCurrency ../totals.totalEmployerContribution}}</td>
          <td>{{formatCurrency ../totals.totalContribution}}</td>
        </tr>
      </tfoot>
      {{/if}}
    </table>

    {{#if @last}}
    <div class="form-summary">
      <div class="summary-box">
        <span>Employee (8%)</span>
        <strong>{{formatCurrency ../totals.totalEmployeeContribution}}</strong>
      </div>
      <div class="summary-box">
        <span>Employer (12%)</span>
        <strong>{{formatCurrency ../totals.totalEmployerContribution}}</strong>
      </div>
      <div class="summary-box highlight">
        <span>TOTAL EPF PAYABLE</span>
        <strong>{{formatCurrency ../totals.totalContribution}}</strong>
      </div>
    </div>
    {{/if}}

    <div class="print-page-footer">Page {{add @index 1}}</div>
  </div>
  {{/each}}
</div>`;
}

export function getEtfFormHtml(): string {
  return `<div class="paginated-document">
  {{#each (chunk salaries 25)}}
  <div class="report-page statutory-form">
    <div class="form-letterhead">
      <div class="form-company">{{../company.name}}</div>
      <div class="form-company-meta">{{../company.address}} &bull; Employer No: {{../company.employerNumber}}</div>
    </div>
  
    <div class="form-title-row">
      <span class="form-title">ETF CONTRIBUTION SCHEDULE</span>
      <span class="form-period">Page {{add @index 1}}</span>
    </div>

    <table class="form-table">
      <thead>
        <tr>
          <th style="width:30px">#</th>
          <th class="name-cell">EMPLOYEE NAME</th>
          <th>MEMBER NO</th>
          <th>GROSS EARNINGS</th>
          <th>EMPLOYER (3%)</th>
        </tr>
      </thead>
      <tbody>
        {{#each this as |row idx|}}
        <tr>
          <td class="td-num">{{add idx 1}}</td>
          <td class="name-cell">{{row.employee.fullName}}</td>
          <td>{{row.employee.memberNo}}</td>
          <td>{{formatCurrency row.grossEarnings}}</td>
          <td class="bold">{{formatCurrency row.etfEmployer}}</td>
        </tr>
        {{/each}}
      </tbody>
      {{#if @last}}
      <tfoot>
        <tr class="totals-row">
          <td colspan="4">SCHEDULE TOTALS</td>
          <td>{{formatCurrency ../totals.totalContribution}}</td>
        </tr>
      </tfoot>
      {{/if}}
    </table>

    {{#if @last}}
    <div class="form-summary">
      <div class="summary-box highlight">
        <span>TOTAL ETF PAYABLE (3%)</span>
        <strong>{{formatCurrency ../totals.totalContribution}}</strong>
      </div>
    </div>
    {{/if}}

    <div class="print-page-footer">Page {{add @index 1}}</div>
  </div>
  {{/each}}
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
    case DocumentType.EPF_FORM:
      return getEpfFormHtml();
    case DocumentType.ETF_FORM:
      return getEtfFormHtml();
    default:
      return '<div class="template"><h1>{{company.name}}</h1></div>';
  }
}
