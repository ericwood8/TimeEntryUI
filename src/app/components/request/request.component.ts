import { apiMessage } from "../../services/api-error";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Request } from '../../models/request';
import { ClearanceType, ExpenseType, LeaveType, OvertimeType, SY_RequestStatusType } from '../../utils/enums';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RequestService } from '../../services/request.service';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee';
import { AuthService } from '../../services/auth.service';

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
export class RequestComponent {

  pageSize = 5; // Default page size
  currentPage = 0;
  allRequests: Request[] = [];
  requests: Request[] = [];
  paginatedRequests: Request[] = [];
  selectedRequest: Request | null = null;
  hasSearchResult!: boolean;
  employees: Employee[] = [];

  selectedReason: string | null = null;

  showClearanceOptions = false;
  showOvertimeOptions = false;
  showLeaveOptions = false;
  showExpenseOptions = false;

  SY_RequestStatusTypeEnum = SY_RequestStatusType;

  statusTypeOptions = Object.entries(SY_RequestStatusType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({ key, value: value as number }));
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

  constructor(private requestService: RequestService, private employeeService: EmployeeService, private changeRef: ChangeDetectorRef, private auth: AuthService) { }

  ngOnInit(): void {
    this.getList();
    //this.getEmployees();
  }

  private getList(): void {
    this.requestService.getAll().subscribe((data) => {
      this.allRequests = this.requests = data;
      this.paginatedRequests = this.requests.slice(0, this.pageSize);
      this.hasSearchResult = false;
    });
  }

  private getEmployees(): void {
    this.employeeService.getAll().subscribe((data) => {
      this.employees = data;
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  private updatePagination(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRequests = this.requests.slice(startIndex, endIndex);
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
      if (this.selectedRequest != null)
      {
          this.selectedRequest.clearanceTypeId = 1; // default
      }       
    } else if (reason === 'Overtime') {
      this.showOvertimeOptions = true;
      if (this.selectedRequest != null)
      {
        this.selectedRequest.overtimeTypeId = 1; // default
        this.selectedRequest.overtimeHrsRequested = 1; // default to 1 hour
      }      
    } else if (reason === 'Leave') {
      this.showLeaveOptions = true;
      if (this.selectedRequest != null)
      {
        this.selectedRequest.leaveTypeId = 2; // default is PTO
      } 
    } else if (reason === 'Expense') {
      this.showExpenseOptions = true;
      if (this.selectedRequest != null)
      {
        this.selectedRequest.expenseTypeId = 1; // default
      }
    }
  }

  resetOptions(): void {
    this.showClearanceOptions = false;
    this.showOvertimeOptions = false;
    this.showLeaveOptions = false;
    this.showExpenseOptions = false;
  }

  // onSubmit(): void {
  //   console.log({
  //     reason: this.selectedReason,
  //     clearanceType: this.clearanceType,
  //     overtimeType: this.overtimeType,
  //     overtimeHours: this.overtimeHours,
  //     leaveType: this.leaveType,
  //     leaveStart: this.leaveStart,
  //     leaveEnd: this.leaveEnd,
  //     expenseType: this.expenseType,
  //     requestDate: this.requestDate,
  //   });
  //   alert('Request submitted successfully!');
  // }

  submit(request: Request): void {
    if (request.requestId && request.requestId > 0) {
      // an update keeps who asked and when: the server owns those, so they are left exactly as loaded
      this.requestService.update(request.requestId, request).subscribe({
        next: () => {
          console.log("Updated successfully!");
          this.selectedRequest = null;
          this.getList();
        },
        error: (error) => {
          if (error.status == 400) { alert(apiMessage(error, "Bad submission!")); }
          else { alert(apiMessage(error, "Problem while updating request!")); }
          console.log("Problem while updating request!");
        }
      });
    }
    else {
      // the server takes the owner from the sign-in; this only keeps the form data complete
      request.employeeId = this.auth.user()?.employeeId ?? request.employeeId;
      request.whenRequested = new Date();
      request.requestId = 0;
      request.statusDate = new Date();
      request.sY_RequestStatusTypeId = SY_RequestStatusType.Pending;
      this.requestService.create(request).subscribe({
        next: (request) => {
          this.getList();
          this.selectedRequest = null;
        },
        error: (error) => {
          if (error.status == 400) { alert(apiMessage(error, "Bad submission!")); }
          else { alert(apiMessage(error, "Problem while adding request!")); }
        }
      });
    }
  }

  delete(requestId: number): void {
    if (confirm("Are you sure you want to delete this request?")) {
      this.requestService.delete(requestId).subscribe({
        next: () => {
          console.log("Delete successfully!");
          this.requests = this.allRequests.filter((p) => p.requestId !== requestId);
          this.updatePagination();
          this.changeRef.detectChanges();
        },
        error: (error) => {
          alert("Sorry, you can not delete this record.");
          console.log("Problem while deleting request!");
        }
      });
    }
  }

  add(): void {
    this.selectedRequest = { employeeId: 0, whenRequested: new Date(), sY_RequestStatusTypeId: 1 };
  }

  edit(request: Request): void {
    // edit a COPY: changing the row itself would change what the grid shows
    this.selectedRequest = { ...request };
    if (this.selectedRequest.leaveStart && this.selectedRequest.leaveStart.indexOf("T") > -1) {
      this.selectedRequest.leaveStart = this.selectedRequest.leaveStart.split("T")[0];
    }
    if (this.selectedRequest.leaveEnd && this.selectedRequest.leaveEnd.indexOf("T") > -1) {
      this.selectedRequest.leaveEnd = this.selectedRequest.leaveEnd.split("T")[0];
    }
    this.showOptionsFor(request?.reason);
  }

  cancel(): void {
    this.selectedRequest = null;
  }

}
