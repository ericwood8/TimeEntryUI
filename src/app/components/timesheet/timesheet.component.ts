import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TimeSheetService } from '../../services/timesheet.service';
import { TimeSheet } from '../../models/timesheet';
import { TimesheetdetailComponent } from "../timesheetdetail/timesheetdetail.component";
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeLookup } from '../../models/employee';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PagedCrudScreen } from '../crud-screen';
import { inject } from '@angular/core';

@Component({
  selector: 'app-timegrid',
  standalone: true,
  imports: [ReactiveFormsModule, TimesheetdetailComponent, FormsModule, DatePipe, MatPaginatorModule],
  templateUrl: './timesheet.component.html',
  styleUrl: './timesheet.component.css'
})
export class TimeSheetComponent extends PagedCrudScreen<TimeSheet> {
  protected readonly service = inject(TimeSheetService);
  protected readonly noun = 'time sheet';
  protected readonly idKey = 'timeSheetId';
  protected readonly gridKey = 'timesheet';
  readonly sortableColumns = ['employee', 'whenEntered', 'notes'];
  readonly defaultSort = 'whenEntered:desc';   // newest first
  private readonly employeeService = inject(EmployeeService);

  employees: EmployeeLookup[] = [];
  showTimeSheetDetails: boolean = false;

  /** The detail panel binds to the selected sheet by this name (it takes undefined for none). */
  get selectedTimeSheet(): TimeSheet | undefined {
    return this.selectedRow ?? undefined;
  }
  set selectedTimeSheet(sheet: TimeSheet | undefined) {
    this.selectedRow = sheet ?? null;
  }

  protected override start(): void {
    // the employees must be here before the time sheets can be matched to their names
    this.employeeService.getLookup().subscribe(value => {
      this.employees = value;
      super.start();
    });
  }

  protected newRow(): TimeSheet {
    return { timeSheetId: undefined, whenEntered: undefined, employeeId: undefined, notes: '' };
  }

  protected override prepare(timeSheet: TimeSheet, isNew: boolean): void {
    if (isNew) {
      timeSheet.whenEntered = new Date();
    }
  }

  protected override pageLoaded(): void {
    this.rows.forEach(timeSheet => {
      timeSheet.employee = this.employees.find(employee => employee.employeeId == timeSheet.employeeId);
    });
  }

  public showDetails(timeSheet: TimeSheet, show: boolean) {
    this.showTimeSheetDetails = show;
    this.selectedTimeSheet = timeSheet;
  }
}
