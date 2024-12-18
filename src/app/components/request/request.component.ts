import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Request } from '../../models/request';
import { ClearanceType, ExpenseType, LeaveType, OvertimeType, SY_RequestStatusType } from '../../utils/enums';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RequestService } from '../../services/request.service';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee';

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
  currentEmployeeId: number = 2;

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

  constructor(private requestService: RequestService, private employeeService: EmployeeService, private changeRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getList();
    //this.getEmployees();
  }

  private getList(): void {
    this.requestService.get().subscribe((data) => {
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

  onReasonChange(reason: string): void {
    this.resetOptions();
    this.selectedReason = reason;

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
    request.employeeId = this.currentEmployeeId;
    request.whenRequested = new Date();
    if (request.requestId && request.requestId > 0) {
      this.requestService.update(request.requestId, request).subscribe(() => {
        console.log("Updated successfully!");
        this.selectedRequest = null;
        this.getList();
      }, (error) => {
        if (error.status == 400) { alert("Bad submission!"); }
        else { alert("Problem while updating request!"); }
        console.log("Problem while updating request!");
      });
    }
    else {
      request.requestId = 0;
      request.statusDate = new Date();
      request.sY_RequestStatusTypeId = SY_RequestStatusType.Pending;
      this.requestService.create(request).subscribe((request) => {
        this.getList();
        this.selectedRequest = null;
      }, (error) => {
        if (error.status == 400) { alert("Bad submission!"); }
        else if (error.status == 422) {
          alert("Request already exists!");
        }
      });
    }
  }

  delete(requestId: number): void {
    if (confirm("Are you sure you want to delete this request?")) {
      this.requestService.delete(requestId).subscribe(() => {
        console.log("Delete successfully!");
        this.requests = this.allRequests.filter((p) => p.requestId !== requestId);
        this.updatePagination();
        this.changeRef.detectChanges();
      }, (error) => {
        alert("Sorry, you can not delete this record.");
        console.log("Problem while deleting request!");
      });
    }
  }

  add(): void {
    this.selectedRequest = { employeeId: 0, whenRequested: new Date(), sY_RequestStatusTypeId: 1 };
  }

  edit(request: Request): void {
    if(request.leaveStart && request.leaveStart?.indexOf("T") > -1){
      request.leaveStart = request.leaveStart?.split("T")[0];
    }
    if(request.leaveEnd && request.leaveEnd?.indexOf("T") > -1){
      request.leaveEnd = request.leaveEnd?.split("T")[0];
    }
    this.selectedRequest = { ...request };
    this.onReasonChange(request?.reason ?? 'Clearance');
  }

  cancel(): void {
    this.selectedRequest = null;
  }

}
