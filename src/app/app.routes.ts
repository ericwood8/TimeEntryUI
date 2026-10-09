import { Routes } from '@angular/router';
import { ProjectComponent } from './components/project/project.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { DepartmentComponent } from './components/department/department.component';
import { TimeSheetComponent } from './components/timesheet/timesheet.component';
import { HolidayComponent } from './components/holiday/holiday.component';
import { RequestComponent } from './components/request/request.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', canActivate: [authGuard], component: ProjectComponent },
    { path: 'employee', canActivate: [authGuard], component: EmployeeComponent },
    { path: 'department', canActivate: [authGuard], component: DepartmentComponent },
    { path: 'holiday', canActivate: [authGuard], component: HolidayComponent },
    { path: 'time', canActivate: [authGuard], component: TimeSheetComponent},
    { path: 'request', canActivate: [authGuard], component: RequestComponent}   
];
