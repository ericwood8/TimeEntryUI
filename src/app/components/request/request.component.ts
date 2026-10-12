import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { Request } from '../../models/request';
import { ClearanceType, ExpenseType, LeaveType, OvertimeType } from '../../utils/enums';
import { RequestStatus } from '../../models/request-status';
import { apiMessage } from '../../services/api-error';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RequestService } from '../../services/request.service';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeLookup } from '../../models/employee';
import { AuthService } from '../../services/auth.service';
import { PagedCrudScreen } from '../crud-screen';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatPaginatorModule
  ],
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css'],
})
export class RequestComponent extends PagedCrudScreen<Request> {
  protected readonly service = inject(RequestService);
  protected readonly noun = 'request';
  protected readonly idKey = 'requestId';
  protected readonly gridKey = 'request';
  protected override readonly badInputMessage = 'Bad submission!';
  private readonly employeeService = inject(EmployeeService);
  private readonly auth = inject(AuthService);

  override pageSize = 5;
  readonly sortableColumns = ['employee', 'reason', 'whenRequested', 'status'];
  readonly defaultSort = 'whenRequested:desc';   // newest first
  employees: EmployeeLookup[] = [];

  selectedReason: string | null = null;

  showClearanceOptions = false;
  showOvertimeOptions = false;
  showLeaveOptions = false;
  showExpenseOptions = false;

  /** The statuses and where each can go, as the server lists them. */
  statuses: RequestStatus[] = [];
  /** The pending requests of the people who report to the signed-in person. */
  toApprove: Request[] = [];

  clearanceOptions = Object.entries(ClearanceType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({ key, value: value as number }));
  overtimeOptions = Object.entries(OvertimeType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({ key, value: value as number }));
  leaveOptions = Object.entries(LeaveType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({ key, value: value as number }));
  expenseOptions = Object.entries(ExpenseType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({ key, value: value as number }));

  clearanceType: string | null = null;
  overtimeType: string | null = null;
  overtimeHours: number | null = null;
  leaveType: string | null = null;
  leaveStart: string | null = null;
  leaveEnd: string | null = null;
  expenseType: string | null = null;
  requestDate: string | null = null;

  protected override start(): void {
    super.start();
    this.employeeService.getLookup().subscribe((data) => { this.employees = data; });
    this.service.getStatuses().subscribe((data) => { this.statuses = data; });
    this.loadToApprove();
  }

  private loadToApprove(): void {
    this.service.getToApprove().subscribe((data) => { this.toApprove = data; });
  }

  /** The name of a status, from the server's list. */
  statusName(id?: number): string {
    return this.statuses.find((s) => s.id === id)?.name ?? '';
  }

  /** Decide a request someone else made: the server moves the status (and a leave request's hours) or says why not. */
  decide(request: Request, statusId: number): void {
    this.service.setStatus(request, statusId).subscribe({
      next: () => { this.load(); this.loadToApprove(); },
      error: (error) => { alert(apiMessage(error, 'Problem while deciding!')); this.load(); this.loadToApprove(); }
    });
  }

  /** The person's own request can be withdrawn while it is pending or approved. */
  canCancel(request: Request): boolean {
    const canceled = this.statuses.find((s) => s.name === 'Canceled')?.id;
    const here = this.statuses.find((s) => s.id === request.sY_RequestStatusTypeId);
    return request.employeeId === this.auth.user()?.employeeId && canceled !== undefined && !!here?.next.includes(canceled);
  }

  cancelRequest(request: Request): void {
    const canceled = this.statuses.find((s) => s.name === 'Canceled')!.id;
    if (confirm('Cancel this request?')) { this.decide(request, canceled); }
  }

  /** The id of a status by name; the buttons are named after the statuses the server lists. */
  private statusId(name: string): number | undefined {
    return this.statuses.find((s) => s.name === name)?.id;
  }

  approve(request: Request): void { this.decide(request, this.statusId('Approved')!); }
  reject(request: Request): void { this.decide(request, this.statusId('Rejected')!); }

  /** The name to show in place of an employee id (the employees are loaded once for the grid). */
  employeeName(id?: number): string {
    return this.employees.find((e) => e.employeeId === id)?.name ?? '';
  }

  /** Shows the option panel that goes with the reason, and leaves the stored values alone (used when editing). */
  private showOptionsFor(reason: string | null | undefined): void {
    this.resetOptions();
    this.selectedReason = reason ?? null;
    this.showClearanceOptions = reason === 'Clearance';
    this.showOvertimeOptions = reason === 'Overtime';
    this.showLeaveOptions = reason === 'Leave';
    this.showExpenseOptions = reason === 'Expense';
  }

  /** The user picked a different reason: show its panel and start its values at the defaults. */
  onReasonChange(reason: string): void {
    this.showOptionsFor(reason);

    if (reason === 'Clearance') {
      this.showClearanceOptions = true;
      if (this.selectedRow != null)
      {
          this.selectedRow.clearanceTypeId = 1; // default
      }       
    } else if (reason === 'Overtime') {
      this.showOvertimeOptions = true;
      if (this.selectedRow != null)
      {
        this.selectedRow.overtimeTypeId = 1; // default
        this.selectedRow.overtimeHrsRequested = 1; // default to 1 hour
      }      
    } else if (reason === 'Leave') {
      this.showLeaveOptions = true;
      if (this.selectedRow != null)
      {
        this.selectedRow.leaveTypeId = 2; // default is PTO
      } 
    } else if (reason === 'Expense') {
      this.showExpenseOptions = true;
      if (this.selectedRow != null)
      {
        this.selectedRow.expenseTypeId = 1; // default
      }
    }
  }

  resetOptions(): void {
    this.showClearanceOptions = false;
    this.showOvertimeOptions = false;
    this.showLeaveOptions = false;
    this.showExpenseOptions = false;
  }

  protected newRow(): Request {
    return { employeeId: 0, whenRequested: new Date(), sY_RequestStatusTypeId: 0 };   // 0: the server starts it as Pending
  }

  protected override prepare(request: Request, isNew: boolean): void {
    // an update keeps who asked and when: the server owns those, so they are left exactly as loaded
    if (isNew) {
      // the server takes the owner from the sign-in; this only keeps the form data complete
      request.employeeId = this.auth.user()?.employeeId ?? request.employeeId;
      request.whenRequested = new Date();
      request.statusDate = new Date();
      request.sY_RequestStatusTypeId = 0;
    }
  }

  protected override prepareEdit(copy: Request): Request {
    if (copy.leaveStart && copy.leaveStart.indexOf("T") > -1) {
      copy.leaveStart = copy.leaveStart.split("T")[0];
    }
    if (copy.leaveEnd && copy.leaveEnd.indexOf("T") > -1) {
      copy.leaveEnd = copy.leaveEnd.split("T")[0];
    }
    this.showOptionsFor(copy.reason);
    return copy;
  }

  override add(): void {
    super.add();
    this.showOptionsFor(null);
  }
}
