import { Routes } from '@angular/router';
import { ProjectComponent } from './components/project/project.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { DepartmentComponent } from './components/department/department.component';
import { TimeSheetComponent } from './components/timesheet/timesheet.component';
import { HolidayComponent } from './components/holiday/holiday.component';
import { RequestComponent } from './components/request/request.component';

export const routes: Routes = [
    { path: '', component: ProjectComponent },
    { path: 'employee', component: EmployeeComponent },
    { path: 'department', component: DepartmentComponent },
    { path: 'holiday', component: HolidayComponent },
    { path : 'time', component: TimeSheetComponent},
    { path : 'request', component: RequestComponent}   
];
