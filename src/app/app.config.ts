import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TimeSheetService } from './services/timesheet.service';
import { ProjectService } from './services/project.service';
import { EmployeeService } from './services/employee.service';
import { DepartmentService } from './services/department.service';
import { HolidayService } from './services/holiday.service';
import { TimeSheetDetailService } from './services/timesheetdetail.service';
import { ProjectTasksService } from './services/projecttasks.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),     
    provideAnimationsAsync(),  
    TimeSheetService, 
    TimeSheetDetailService,
    ProjectService, 
    EmployeeService,
    DepartmentService,
    HolidayService,
    ProjectTasksService
  ]
};
