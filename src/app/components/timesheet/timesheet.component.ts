import { Component, model, ModelSignal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TimeSheetService } from '../../services/timesheet.service';
import { TimeSheet } from '../../models/timesheet';
import { TimesheetdetailComponent } from "../timesheetdetail/timesheetdetail.component";
import { ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-timegrid',
  standalone: true,
  imports: [ReactiveFormsModule, TimesheetdetailComponent, FormsModule],
  templateUrl: './timesheet.component.html',
  styleUrl: './timesheet.component.css'
})
export class TimeSheetComponent {
  timeSheets: TimeSheet[];
  employees: Employee[];
  selectedTimeSheet: TimeSheet | undefined;
  showTimeSheetDetails : boolean = false;


  constructor(private timeSheetService: TimeSheetService, private employeeService: EmployeeService) {
    this.timeSheets = [];
    this.employees = [];
  }

  ngOnInit(){
    this.getEmployees();
    this.getTimeSheets();
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
        next: (timeSheet) => {
          this.timeSheets.push(timeSheet)
          this.clear();
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
        next: (timeSheet) => {
        this.clear();
        }
      });
    }
  }

  public delete(timeSheet: TimeSheet) {
    if (timeSheet.timeSheetId) {
      this.timeSheetService.delete(timeSheet.timeSheetId);
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
    this.timeSheetService.get().subscribe({
      next: (timeSheets) => {
        this.timeSheets = timeSheets
        this.timeSheets.forEach(timeSheet => {
          timeSheet.employee = this.employees[this.employees.findIndex(employee => employee.employeeId == timeSheet.employeeId)];
        });
      }
    }
    )
  }

  private getEmployees() {
    this.employeeService.getAll().subscribe(value => this.employees = value);
  }

  private getDaysInWeekUTC(date: Date) {
    let days = [];
    let diff = date.getDay();
    let startOfWeek = date;
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    for (let i = 0; i < 7; i++) {
      let day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }
}