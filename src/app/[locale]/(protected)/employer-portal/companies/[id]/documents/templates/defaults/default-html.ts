import { DocumentType } from '@/types/template';

/* ─── PAYSLIP (single slip per render — print service batches 4 per page) ── */
export function getPayslipHtml(): string {
  return `<div class="slip">
  <div class="slip-header">
    <div class="company-block">
      {{#if company.logo}}<img src="{{company.logo}}" class="co-logo" alt="logo" />{{/if}}
      <div>
        <div class="co-name">{{company.name}}</div>
        <div class="co-address">{{company.address}}</div>
      </div>
    </div>
    <div class="slip-meta">
      <div class="slip-title">Pay Slip</div>
      <div class="slip-period">{{periodStartDate}} &ndash; {{periodEndDate}}</div>
    </div>
  </div>

  <div class="emp-strip">
    <div class="emp-field">
      <span class="f-lbl">Emp No</span>
      <span class="f-val">{{employee.employeeNo}}</span>
    </div>
    <div class="emp-field">
      <span class="f-lbl">Name</span>
      <span class="f-val">{{employee.fullName}}</span>
    </div>
    <div class="emp-field">
      <span class="f-lbl">Designation</span>
      <span class="f-val">{{employee.designation}}</span>
    </div>
    <div class="emp-field">
      <span class="f-lbl">Department</span>
      <span class="f-val">{{employee.department.name}}</span>
    </div>
    <div class="emp-field">
      <span class="f-lbl">NIC</span>
      <span class="f-val">{{employee.nic}}</span>
    </div>
    <div class="emp-field">
      <span class="f-lbl">Pay Date</span>
      <span class="f-val">{{payDate}}</span>
    </div>
  </div>

  <div class="body-grid">
    <div class="col">
      <div class="col-head earn-head">Earnings</div>
      <div class="row"><span>Basic Salary</span><span>{{formatCurrency salary.basicSalary}}</span></div>
      {{#if salary.otPay}}<div class="row"><span>Overtime Pay</span><span>{{formatCurrency salary.otPay}}</span></div>{{/if}}
      {{#if salary.holidayPay}}<div class="row"><span>Holiday Pay</span><span>{{formatCurrency salary.holidayPay}}</span></div>{{/if}}
      {{#each salary.additions}}
      <div class="row"><span>{{this.name}}</span><span>{{formatCurrency this.amount}}</span></div>
      {{/each}}
      <div class="row subtotal"><span>Gross Earnings</span><span>{{formatCurrency salary.grossSalary}}</span></div>
    </div>
    <div class="col">
      <div class="col-head deduct-head">Deductions</div>
      <div class="row"><span>EPF (8%)</span><span>{{formatCurrency salary.epfEmployee}}</span></div>
      {{#if salary.noPay}}<div class="row"><span>No Pay</span><span>{{formatCurrency salary.noPay}}</span></div>{{/if}}
      {{#if salary.lateDeduction}}<div class="row"><span>Late Deduction</span><span>{{formatCurrency salary.lateDeduction}}</span></div>{{/if}}
      {{#if salary.advanceDeduction}}<div class="row"><span>Advance Recovery</span><span>{{formatCurrency salary.advanceDeduction}}</span></div>{{/if}}
      {{#if salary.taxAmount}}<div class="row"><span>Income Tax</span><span>{{formatCurrency salary.taxAmount}}</span></div>{{/if}}
      {{#each salary.deductions}}
      <div class="row"><span>{{this.name}}</span><span>{{formatCurrency this.amount}}</span></div>
      {{/each}}
      <div class="row subtotal"><span>Total Deductions</span><span>{{formatCurrency salary.totalDeductions}}</span></div>
    </div>
  </div>

  <div class="statutory-strip">
    <span class="s-lbl">EPF (Emp 8%):</span><span class="s-val">{{formatCurrency salary.epfEmployee}}</span>
    <span class="s-sep">|</span>
    <span class="s-lbl">EPF (Er 12%):</span><span class="s-val">{{formatCurrency salary.epfEmployer}}</span>
    <span class="s-sep">|</span>
    <span class="s-lbl">ETF (Er 3%):</span><span class="s-val">{{formatCurrency salary.etfEmployer}}</span>
    <span class="s-note">&nbsp;Employer contributions are not deducted from salary</span>
  </div>

  <div class="net-bar">
    <span class="net-label">Net Pay</span>
    <span class="net-amount">{{formatCurrency salary.netSalary}}</span>
  </div>

  <div class="slip-note">
    {{#if employee.details.bankName}}Bank: {{employee.details.bankName}}{{/if}}
    {{#if employee.details.accountNumber}}&nbsp;&mdash;&nbsp;Acc: {{employee.details.accountNumber}}{{/if}}
    &nbsp;&nbsp;This is a computer-generated document. No signature required.
  </div>
</div>`;
}

/* ─── SALARY SHEET ───────────────────────────────────────────────────────── */
export function getSalarySheetHtml(): string {
  return `<div class="paginated-document">
  {{#each (chunk salaries 22)}}
  <div class="report-page landscape">
    <div class="header">
      <div class="header-logo">
        {{#if ../company.logo}}<img src="{{../company.logo}}" class="company-logo" alt="logo" />{{/if}}
        <div class="header-text">
          <h1>{{../company.name}}</h1>
          <h2>Salary Sheet &mdash; {{../month}}/{{../year}} (Page {{add @index 1}})</h2>
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
          <td>{{formatCurrency row.otPay}}</td>
          <td>{{formatCurrency row.holidayPay}}</td>
          {{#each ../../additionColumns as |col|}}<td>{{formatCurrency (getCustomTotal row.additionAmounts col)}}</td>{{/each}}
          <td>{{formatCurrency row.noPay}}</td>
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

/* ─── ATTENDANCE REPORT ──────────────────────────────────────────────────── */
export function getAttendanceReportHtml(): string {
  return `<div class="paginated-document">
{{#each (chunk logs 25)}}
<div class="report-page">

  <div class="att-header">
    <div class="hdr-left">
      {{#if ../company.logo}}<img src="{{../company.logo}}" class="company-logo" alt="logo" />{{/if}}
      <div>
        <div class="co-name">{{../company.name}}</div>
        <div class="co-addr">{{../company.address}}</div>
      </div>
    </div>
    <div class="hdr-right">
      <div class="rpt-title">Attendance Report</div>
      <div class="rpt-period">{{../startDate}} &ndash; {{../endDate}}&nbsp;&nbsp;&bull;&nbsp;&nbsp;Page {{add @index 1}}</div>
    </div>
  </div>

  {{#if @first}}
  <div class="emp-box">
    <div class="emp-f">
      <span class="e-lbl">Employee Name</span>
      <span class="e-val">{{../employee.fullName}}</span>
    </div>
    <div class="emp-f">
      <span class="e-lbl">Employee No</span>
      <span class="e-val">{{../employee.employeeNo}}</span>
    </div>
    <div class="emp-f">
      <span class="e-lbl">NIC</span>
      <span class="e-val">{{../employee.nic}}</span>
    </div>
    <div class="emp-f">
      <span class="e-lbl">Designation</span>
      <span class="e-val">{{../employee.designation}}</span>
    </div>
    <div class="emp-f">
      <span class="e-lbl">Department</span>
      <span class="e-val">{{../employee.department.name}}</span>
    </div>
    <div class="emp-f">
      <span class="e-lbl">Employment Type</span>
      <span class="e-val">{{../employee.employmentType}}</span>
    </div>
  </div>

  <div class="sum-strip">
    <div class="s-card card-present">
      <div class="s-num">{{../summary.presentDays}}</div>
      <div class="s-txt">Present</div>
    </div>
    <div class="s-card card-absent">
      <div class="s-num">{{../summary.absentDays}}</div>
      <div class="s-txt">Absent</div>
    </div>
    <div class="s-card card-late">
      <div class="s-num">{{../summary.lateDays}}</div>
      <div class="s-txt">Late</div>
    </div>
    <div class="s-card card-leave">
      <div class="s-num">{{../summary.leavesTaken}}</div>
      <div class="s-txt">Leave Days</div>
    </div>
    <div class="s-card card-ot">
      <div class="s-num">{{../summary.overtimeMinutes}}</div>
      <div class="s-txt">OT Mins</div>
    </div>
    <div class="s-card card-total">
      <div class="s-num">{{../summary.totalDays}}</div>
      <div class="s-txt">Total Days</div>
    </div>
  </div>
  {{/if}}

  <table class="att-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Shift</th>
        <th>Check In</th>
        <th>Check Out</th>
        <th>Work Hrs</th>
        <th>OT Mins</th>
        <th>Late Mins</th>
        <th>Status</th>
        <th>Remarks</th>
      </tr>
    </thead>
    <tbody>
      {{#each this}}
      <tr class="{{#if this.isOnLeave}}row-leave{{else}}{{#if this.isLate}}row-late{{/if}}{{/if}}">
        <td>{{this.date}}</td>
        <td>{{this.shiftName}}</td>
        <td class="c-num">{{this.checkInTime}}</td>
        <td class="c-num">{{this.checkOutTime}}</td>
        <td class="c-num">{{this.workMinutes}}</td>
        <td class="c-num">{{this.overtimeMinutes}}</td>
        <td class="c-num {{#if this.isLate}}late-flag{{/if}}">{{this.lateMinutes}}</td>
        <td>
          {{#if this.isOnLeave}}
            <span class="badge badge-leave">Leave</span>
          {{else}}
            {{#if this.isHalfDay}}
              <span class="badge badge-half">Half Day</span>
            {{else}}
              {{#if this.checkInTime}}
                <span class="badge badge-present">Present</span>
              {{else}}
                <span class="badge badge-absent">Absent</span>
              {{/if}}
            {{/if}}
          {{/if}}
        </td>
        <td>{{this.remarks}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  {{#if @last}}
  <div class="leave-section">
    <div class="section-title">Leave Summary for Period</div>
    <table class="leave-table">
      <thead>
        <tr>
          <th>Leave Type</th>
          <th>From</th>
          <th>To</th>
          <th>Days</th>
          <th>Reason</th>
        </tr>
      </thead>
      <tbody>
        {{#each ../leaves}}
        <tr>
          <td>{{this.type}}</td>
          <td>{{this.startDate}}</td>
          <td>{{this.endDate}}</td>
          <td>{{this.days}}</td>
          <td>{{this.reason}}</td>
        </tr>
        {{else}}
        <tr><td colspan="5" style="text-align:center;color:#aaa;font-style:italic;padding:6px">No approved leave in this period</td></tr>
        {{/each}}
      </tbody>
    </table>
  </div>

  <div class="sig-row">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-label">Prepared By</div>
      <div class="sig-sub">Name / Designation / Date</div>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-label">Verified By</div>
      <div class="sig-sub">Name / Designation / Date</div>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-label">Employee Acknowledgment</div>
      <div class="sig-sub">Signature / Date</div>
    </div>
  </div>
  {{/if}}

  <div class="print-page-footer">{{../company.name}} &mdash; Attendance Report &mdash; Page {{add @index 1}}</div>
</div>
{{/each}}
</div>`;
}

/* ─── EPF FORM C — R-4 Contribution Schedule ────────────────────────────── */
export function getEpfFormHtml(): string {
  return `<div class="paginated-document">
{{#each (chunk salaries 22)}}
<div class="report-page">

  <div class="form-header">
    <div class="fh-left">
      {{#if ../company.logo}}<img src="{{../company.logo}}" class="company-logo" alt="logo" />{{/if}}
      <div>
        <div class="co-name">{{../company.name}}</div>
        <div class="co-meta">{{../company.address}}</div>
      </div>
    </div>
    <div class="fh-center">
      <div class="form-badge">Employees&rsquo; Provident Fund</div>
      <div class="form-title">Form C &mdash; R-4</div>
      <div class="form-sub">Contribution Schedule &mdash; {{../month}}/{{../year}}</div>
    </div>
    <div class="fh-right">
      <div class="ref-box">
        <div class="ref-lbl">Employer No.</div>
        <div class="ref-val">{{../company.employerNumber}}</div>
        <div class="ref-lbl" style="margin-top:4px;">Period</div>
        <div class="ref-val">{{../month}} / {{../year}}</div>
        <div class="ref-lbl" style="margin-top:4px;">Page</div>
        <div class="ref-val">{{add @index 1}}</div>
      </div>
    </div>
  </div>

  {{#if @first}}
  <table class="info-table">
    <tr>
      <td class="i-lbl">Employer Name</td>
      <td class="i-val" colspan="3">{{../company.name}}</td>
    </tr>
    <tr>
      <td class="i-lbl">Address</td>
      <td class="i-val" colspan="3">{{../company.address}}</td>
    </tr>
    <tr>
      <td class="i-lbl">Employer No.</td>
      <td class="i-val">{{../company.employerNumber}}</td>
      <td class="i-lbl">Contribution Period</td>
      <td class="i-val">{{../month}} / {{../year}}</td>
    </tr>
  </table>

  <div class="rate-bar">
    Employee Contribution: <strong>8%</strong> of liable wages &nbsp;&bull;&nbsp;
    Employer Contribution: <strong>12%</strong> of liable wages &nbsp;&bull;&nbsp;
    Total EPF Contribution: <strong>20%</strong> of liable wages
  </div>
  {{/if}}

  <table class="form-table">
    <thead>
      <tr>
        <th class="t-center" style="width:26px">No.</th>
        <th class="t-center" style="width:54px">Emp No</th>
        <th class="t-left">Employee Name</th>
        <th class="t-center" style="width:70px">EPF<br/>Member No.</th>
        <th style="width:82px">Liable<br/>Wages (Rs.)</th>
        <th style="width:68px">Employee<br/>8% (Rs.)</th>
        <th style="width:68px">Employer<br/>12% (Rs.)</th>
        <th style="width:72px">Total<br/>Contribution</th>
      </tr>
    </thead>
    <tbody>
      {{#each this as |row idx|}}
      <tr>
        <td class="t-center">{{add idx 1}}</td>
        <td class="t-center">{{row.employee.employeeNo}}</td>
        <td class="t-left">{{row.employee.fullName}}</td>
        <td class="t-center">{{row.employee.employeeNo}}</td>
        <td class="t-right">{{formatCurrency row.liableEarnings}}</td>
        <td class="t-right">{{formatCurrency row.epfEmployee}}</td>
        <td class="t-right">{{formatCurrency row.epfEmployer}}</td>
        <td class="t-total">{{formatCurrency (add row.epfEmployee row.epfEmployer)}}</td>
      </tr>
      {{/each}}
    </tbody>
    {{#if @last}}
    <tfoot>
      <tr class="totals-row">
        <td colspan="4" class="totals-label">Schedule Total</td>
        <td class="t-right">&nbsp;</td>
        <td class="t-right">{{formatCurrency ../totals.totalEmployeeContribution}}</td>
        <td class="t-right">{{formatCurrency ../totals.totalEmployerContribution}}</td>
        <td class="t-total">{{formatCurrency ../totals.totalContribution}}</td>
      </tr>
    </tfoot>
    {{/if}}
  </table>

  {{#if @last}}
  <div class="surcharge-row">
    <span>Employee Contribution (8%):&nbsp;<strong>{{formatCurrency ../totals.totalEmployeeContribution}}</strong></span>
    <span>Employer Contribution (12%):&nbsp;<strong>{{formatCurrency ../totals.totalEmployerContribution}}</strong></span>
    <span>Surcharge (if applicable):&nbsp;<strong>—</strong></span>
  </div>

  <div class="payable-bar">
    <span class="payable-label">Total EPF Payable</span>
    <span class="payable-amount">Rs. {{formatCurrency ../totals.totalContribution}}</span>
  </div>

  <div class="declaration">
    <div class="declaration-text">
      I / We hereby certify that the above particulars are true and correct, and that all employees liable to contribute to the Employees&rsquo; Provident Fund have been included in this schedule, and that the contributions shown have been deducted from wages. I am / We are aware that any false statement made in this form renders me / us liable to prosecution under the Employees&rsquo; Provident Fund Act No.&nbsp;15 of 1958 and its amendments.
    </div>
    <div class="sig-grid">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Authorized Signatory</div>
        <div class="sig-date">Name:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date:</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Employer / Director</div>
        <div class="sig-date">Designation:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date:</div>
      </div>
      <div class="sig-block stamp-block">
        <div class="stamp-lbl">Company Seal / Stamp</div>
        <div class="stamp-box"></div>
      </div>
    </div>
  </div>
  {{/if}}

  <div class="form-footer">EPF Form C (R-4) &mdash; {{../company.name}} &mdash; {{../month}}/{{../year}} &mdash; Page {{add @index 1}} &mdash; Computer Generated</div>
</div>
{{/each}}
</div>`;
}

/* ─── ETF FORM C — R-4 Contribution Schedule ────────────────────────────── */
export function getEtfFormHtml(): string {
  return `<div class="paginated-document">
{{#each (chunk salaries 25)}}
<div class="report-page">

  <div class="form-header">
    <div class="fh-left">
      {{#if ../company.logo}}<img src="{{../company.logo}}" class="company-logo" alt="logo" />{{/if}}
      <div>
        <div class="co-name">{{../company.name}}</div>
        <div class="co-meta">{{../company.address}}</div>
      </div>
    </div>
    <div class="fh-center">
      <div class="form-badge">Employees&rsquo; Trust Fund</div>
      <div class="form-title">Form C &mdash; R-4</div>
      <div class="form-sub">Contribution Schedule &mdash; {{../month}}/{{../year}}</div>
    </div>
    <div class="fh-right">
      <div class="ref-box">
        <div class="ref-lbl">Employer No.</div>
        <div class="ref-val">{{../company.employerNumber}}</div>
        <div class="ref-lbl" style="margin-top:4px;">Period</div>
        <div class="ref-val">{{../month}} / {{../year}}</div>
        <div class="ref-lbl" style="margin-top:4px;">Page</div>
        <div class="ref-val">{{add @index 1}}</div>
      </div>
    </div>
  </div>

  {{#if @first}}
  <table class="info-table">
    <tr>
      <td class="i-lbl">Employer Name</td>
      <td class="i-val" colspan="3">{{../company.name}}</td>
    </tr>
    <tr>
      <td class="i-lbl">Address</td>
      <td class="i-val" colspan="3">{{../company.address}}</td>
    </tr>
    <tr>
      <td class="i-lbl">Employer No.</td>
      <td class="i-val">{{../company.employerNumber}}</td>
      <td class="i-lbl">Contribution Period</td>
      <td class="i-val">{{../month}} / {{../year}}</td>
    </tr>
  </table>

  <div class="rate-bar">
    ETF is an <strong>employer-only</strong> contribution &nbsp;&bull;&nbsp;
    Employer Contribution: <strong>3%</strong> of wages paid &nbsp;&bull;&nbsp;
    No deduction from employee salary
  </div>
  {{/if}}

  <table class="form-table">
    <thead>
      <tr>
        <th class="t-center" style="width:26px">No.</th>
        <th class="t-center" style="width:54px">Emp No</th>
        <th class="t-left">Employee Name</th>
        <th class="t-center" style="width:70px">ETF<br/>Member No.</th>
        <th style="width:90px">Wages Paid<br/>(Rs.)</th>
        <th style="width:80px">Employer<br/>3% (Rs.)</th>
      </tr>
    </thead>
    <tbody>
      {{#each this as |row idx|}}
      <tr>
        <td class="t-center">{{add idx 1}}</td>
        <td class="t-center">{{row.employee.employeeNo}}</td>
        <td class="t-left">{{row.employee.fullName}}</td>
        <td class="t-center">{{row.employee.employeeNo}}</td>
        <td class="t-right">{{formatCurrency row.basicSalary}}</td>
        <td class="t-total">{{formatCurrency row.etfEmployer}}</td>
      </tr>
      {{/each}}
    </tbody>
    {{#if @last}}
    <tfoot>
      <tr class="totals-row">
        <td colspan="4" class="totals-label">Schedule Total</td>
        <td class="t-right">&nbsp;</td>
        <td class="t-total">{{formatCurrency ../totals.totalContribution}}</td>
      </tr>
    </tfoot>
    {{/if}}
  </table>

  {{#if @last}}
  <div class="payable-bar">
    <span class="payable-label">Total ETF Payable (Employer 3%)</span>
    <span class="payable-amount">Rs. {{formatCurrency ../totals.totalContribution}}</span>
  </div>

  <div class="declaration">
    <div class="declaration-text">
      I / We hereby declare that the above particulars relating to the contributions payable to the Employees&rsquo; Trust Fund are true and correct. All employees liable to contribute have been included in this schedule. The contributions shown represent 3% of the wages paid to each employee for the period stated. I / We understand that any false declaration renders me / us liable to prosecution under the Employees&rsquo; Trust Fund Act No.&nbsp;46 of 1980 and its amendments.
    </div>
    <div class="sig-grid">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Authorized Signatory</div>
        <div class="sig-date">Name:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date:</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Employer / Director</div>
        <div class="sig-date">Designation:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date:</div>
      </div>
      <div class="sig-block stamp-block">
        <div class="stamp-lbl">Company Seal / Stamp</div>
        <div class="stamp-box"></div>
      </div>
    </div>
  </div>
  {{/if}}

  <div class="form-footer">ETF Form C (R-4) &mdash; {{../company.name}} &mdash; {{../month}}/{{../year}} &mdash; Page {{add @index 1}} &mdash; Computer Generated</div>
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
