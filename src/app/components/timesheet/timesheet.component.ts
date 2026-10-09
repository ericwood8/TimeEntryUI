import { Component, model, ModelSignal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TimeSheetService } from '../../services/timesheet.service';
import { TimeSheet } from '../../models/timesheet';
import { TimesheetdetailComponent } from "../timesheetdetail/timesheetdetail.component";
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ariaSort, loadSort, nextSort, saveSort, sortMark } from '../../utils/grid-sort';



@Component({
  selector: 'app-timegrid',
  standalone: true,
  imports: [ReactiveFormsModule, TimesheetdetailComponent, FormsModule, DatePipe, MatPaginatorModule],
  templateUrl: './timesheet.component.html',
  styleUrl: './timesheet.component.css'
})
export class TimeSheetComponent {
  timeSheets: TimeSheet[];
  employees: Employee[];
  selectedTimeSheet: TimeSheet | undefined;
  showTimeSheetDetails : boolean = false;

  // the server pages, sorts and searches (E03): this screen holds only the page it shows
  pageSize = 10;
  currentPage = 0;
  total = 0;                       // rows that match the search, over all pages
  readonly sortableColumns = ['employee', 'whenEntered', 'notes'];
  sort = loadSort('timesheet', this.sortableColumns, 'whenEntered:desc');   // the sort the person left, else newest first
  loaded = false;                  // true once a page has arrived, so "No time sheets" is not shown while waiting
  searchText = '';

  constructor(private timeSheetService: TimeSheetService, private employeeService: EmployeeService) {
    this.timeSheets = [];
    this.employees = [];
  }

  ngOnInit(){
    // the employees must be here before the time sheets can be matched to their names
    this.getEmployees();
  }

  public selectTimeSheet(timeSheet: TimeSheet) {
    this.selectedTimeSheet = timeSheet;
  }

  public create(timeSheet: TimeSheet) {
    //New time sheet
    console.log(timeSheet)
    if (timeSheet.timeSheetId == undefined) {
      timeSheet.timeSheetId = 0;
      timeSheet.whenEntered = new Date();
      this.timeSheetService.create(timeSheet).subscribe({
        error: (e) => {
          console.error(e);
        },
        next: (created) => {
          // the server sends back the row without the employee it points to; look it up so the grid can show the name
          this.clear();
          this.getTimeSheets();   // the new sheet is on the first page (newest first) or wherever the sort puts it
        }
      });
    }
    //existing time sheet
    else {
      console.log("edit timesheet")
      this.timeSheetService.update(timeSheet.timeSheetId, timeSheet).subscribe({
        error: (e) => {
          console.error(e);
        },
        next: () => {
          // the person may have picked another employee: refresh the name the grid shows
          timeSheet.employee = this.employeeOf(timeSheet.employeeId);
          this.clear();
        }
      });
    }
  }

  public delete(timeSheet: TimeSheet) {
    if (timeSheet.timeSheetId) {
      this.timeSheetService.delete(timeSheet.timeSheetId).subscribe({
        next: () => { this.getTimeSheets(); },
        error: (e) => { alert(e.status == 400 ? "It cannot be deleted because it is in use!" : "Problem while deleting!"); console.error(e); }
      });
    }
  }

  onSubmit(timeSheet: TimeSheet) {
    this.create(timeSheet);
  }

  public showDetails(timeSheet: TimeSheet, show: boolean) {
    this.showTimeSheetDetails = show;
    this.selectedTimeSheet = timeSheet;
  }

  public new() {
    //Set new selected time sheet
    this.selectedTimeSheet = {
      timeSheetId: undefined,
      whenEntered: undefined,
      employeeId: undefined,
      notes: ''
    }
  }

  public clear() {
    this.selectedTimeSheet = undefined;
  }

  private getTimeSheets() {
    this.timeSheetService.getPage({ pageIndex: this.currentPage, pageSize: this.pageSize, sort: this.sort, search: this.searchText }).subscribe({
      next: (page) => {
        // a page past the end (the last row of the last page was deleted): go back to the last page there is
        if (page.data.length === 0 && page.count > 0 && this.currentPage > 0) {
          this.currentPage = Math.ceil(page.count / this.pageSize) - 1;
          this.getTimeSheets();
          return;
        }
        this.total = page.count;
        this.timeSheets = page.data;
        this.timeSheets.forEach(timeSheet => {
          timeSheet.employee = this.employeeOf(timeSheet.employeeId);
        });
        this.loaded = true;
      }
    }
    )
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getTimeSheets();
  }

  /** Sorts by that column; a second click on the same column reverses the order. The choice is kept for the next visit. */
  sortBy(column: string): void {
    this.sort = nextSort(this.sort, column);
    saveSort('timesheet', this.sort);
    this.currentPage = 0;
    this.getTimeSheets();
  }

  sortMark(column: string): string {
    return sortMark(this.sort, column);
  }

  ariaSort(column: string): 'ascending' | 'descending' | null {
    return ariaSort(this.sort, column);
  }

  search(): void {
    this.currentPage = 0;
    this.getTimeSheets();
  }

  private employeeOf(employeeId?: number): Employee | undefined {
    return this.employees.find(employee => employee.employeeId == employeeId);
  }

  private getEmployees() {
    this.employeeService.getAll().subscribe(value => {
      this.employees = value;
      this.getTimeSheets();
    });
  }
}