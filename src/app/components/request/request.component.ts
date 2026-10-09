import { apiMessage } from "../../services/api-error";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Request } from '../../models/request';
import { ClearanceType, ExpenseType, LeaveType, OvertimeType, SY_RequestStatusType } from '../../utils/enums';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RequestService } from '../../services/request.service';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeLookup } from '../../models/employee';
import { AuthService } from '../../services/auth.service';
import { ariaSort, forgetSort, loadSort, nextSort, saveSort, sortMark } from '../../utils/grid-sort';

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

  // the server pages, sorts and searches (E03): this screen holds only the page it shows
  pageSize = 5; // Default page size
  currentPage = 0;
  total = 0;                       // rows that match the search, over all pages
  paginatedRequests: Request[] = [];
  readonly sortableColumns = ['employee', 'reason', 'whenRequested', 'status'];
  readonly defaultSort = 'whenRequested:desc';   // newest first
  sort = loadSort('request', this.sortableColumns, this.defaultSort);   // the sort the person left, else the default
  sortMenu: { x: number; y: number } | null = null;   // the right-click menu (Clear sort), where it is open
  loaded = false;                  // true once a page has arrived, so "No requests" is not shown while waiting
  searchText = '';
  selectedRequest: Request | null = null;
  employees: EmployeeLookup[] = [];

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
    this.getEmployees();
  }

  private getList(): void {
    this.requestService.getPage({ pageIndex: this.currentPage, pageSize: this.pageSize, sort: this.sort, search: this.searchText }).subscribe((page) => {
      // a page past the end (the last row of the last page was deleted): go back to the last page there is
      if (page.data.length === 0 && page.count > 0 && this.currentPage > 0) {
        this.currentPage = Math.ceil(page.count / this.pageSize) - 1;
        this.getList();
        return;
      }
      this.total = page.count;
      this.paginatedRequests = page.data;
      this.loaded = true;
    });
  }

  /** Sorts by that column; a second click on the same column reverses the order. The choice is kept for the next visit. */
  sortBy(column: string): void {
    this.sort = nextSort(this.sort, column);
    saveSort('request', this.sort);
    this.currentPage = 0;
    this.getList();
  }

  sortMark(column: string): string {
    return sortMark(this.sort, column);
  }

  ariaSort(column: string): 'ascending' | 'descending' | null {
    return ariaSort(this.sort, column);
  }

  /** Back to the default order and forget the saved sort. */
  clearSort(): void {
    this.sort = this.defaultSort;
    forgetSort('request');
    this.sortMenu = null;
    this.currentPage = 0;
    this.getList();
  }

  openSortMenu(event: MouseEvent): void {
    event.preventDefault();
    this.sortMenu = { x: event.clientX, y: event.clientY };
  }

  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  closeSortMenu(): void {
    this.sortMenu = null;
  }

  /** The name to show in place of an employee id (the employees are loaded once for the grid). */
  employeeName(id?: number): string {
    return this.employees.find((e) => e.employeeId === id)?.name ?? '';
  }

  search(): void {
    this.currentPage = 0;
    this.getList();
  }

  private getEmployees(): void {
    this.employeeService.getLookup().subscribe((data) => {
      this.employees = data;
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getList();
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
          this.getList();
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
