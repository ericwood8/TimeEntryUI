import { Component, model, ModelSignal} from '@angular/core';
import { TimeSheetDetail } from '../../models/timesheetdetail';
import { TimeSheetDetailService } from '../../services/timesheetdetail.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectTask } from '../../models/project';
import { TimeSheet } from '../../models/timesheet';
import { ProjectTasksService } from '../../services/projecttasks.service';

@Component({
  selector: 'app-timesheetdetail',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './timesheetdetail.component.html',
  styleUrl: './timesheetdetail.component.css',
})

export class TimesheetdetailComponent {
  timeSheetDetails: TimeSheetDetail[];
  selectedTimeSheetDetail: TimeSheetDetail | undefined;
  selectedTimeSheet = model<TimeSheet | undefined>();
  projects: Project[];
  projectTasks: ProjectTask[];
  showTimeSheetDetails: ModelSignal<boolean> = model(false);

  constructor(private projectTaskService: ProjectTasksService, private projectService: ProjectService, private timeSheetDetailService: TimeSheetDetailService) {
    this.projects = [];
    this.projectTasks = [];
    this.timeSheetDetails = [];
  }

  onSubmit(timeSheetDetail: TimeSheetDetail) {
    this.createUpdateTimeSheetDetail(timeSheetDetail)
  }

  ngOnInit() {
    this.getProjects();
    this.getTimeSheetDetails();
  }

  public clear(){
    this.selectedTimeSheetDetail = undefined;
  }

  onSelectedTimeSheetChange(timeSheet: TimeSheet){
    this.selectedTimeSheet.set(timeSheet);
  }

  public onShowTimeSheetDetails(show: boolean) {
    this.selectedTimeSheet.set(undefined);
    this.showTimeSheetDetails.set(show);
  }

  public getTimeSheetDetails() {
    this.timeSheetDetailService.getTimeSheetDetailById(this.selectedTimeSheet()?.timeSheetId as number).subscribe({
      error: (e) => {
        console.error(e);
      },
      next: (timeSheetDetails) => {
        this.timeSheetDetails = timeSheetDetails;
      }
    });
  }

  public getProjects() {
    this.projectService.get().subscribe(value => this.projects = value);
  }

  public onProjectSelect(id: number) {
    this.projectTaskService.getProjectTasks(id).subscribe(value => this.projectTasks = value);
  }

  public selectTimeSheetDetail(timeSheetDetail: TimeSheetDetail) {
    this.selectedTimeSheetDetail = timeSheetDetail;
  }

  public newTimeSheetDetail() {
    this.selectedTimeSheetDetail = {
      timeSheetDetailId: undefined,
      e_timeSheetId: undefined,
      projectId: undefined,
      projectName: '',
      projectTaskId: undefined,
      projectTaskName: '',
      sundayHours: 0,
      mondayHours: 0,
      tuesdayHours: 0,
      wednesdayHours: 0,
      thursdayHours: 0,
      fridayHours: 0,
      saturdayHours: 0,
      notes: ''
    }
  }

  public createUpdateTimeSheetDetail(timeSheetDetail: TimeSheetDetail) {
    console.log(this.selectedTimeSheet()?.timeSheetId)
    this.selectedTimeSheetDetail = {
      timeSheetDetailId: timeSheetDetail.timeSheetDetailId,
      e_timeSheetId: this.selectedTimeSheet()?.timeSheetId,
      projectId: timeSheetDetail.projectId,
      projectName: timeSheetDetail.projectName,
      projectTaskId: timeSheetDetail.projectTaskId,
      projectTaskName: timeSheetDetail.projectTaskName,
      sundayHours: timeSheetDetail.sundayHours,
      mondayHours: timeSheetDetail.mondayHours,
      tuesdayHours: timeSheetDetail.tuesdayHours,
      wednesdayHours: timeSheetDetail.wednesdayHours,
      thursdayHours: timeSheetDetail.thursdayHours,
      fridayHours: timeSheetDetail.fridayHours,
      saturdayHours: timeSheetDetail.saturdayHours,
      notes: timeSheetDetail.notes
    }
    //New time sheet
    if (this.selectedTimeSheetDetail.timeSheetDetailId == undefined) {
      this.selectedTimeSheetDetail.timeSheetDetailId = 0;
      this.timeSheetDetailService.createTimeSheetDetail(this.selectedTimeSheetDetail).subscribe({
        error: (e) => {
          console.error(e);
        },
        next: (timeSheetDetail) => {
          this.selectedTimeSheetDetail = undefined;
        }
      });
    }
    //existing time sheet
    else {
      this.timeSheetDetailService.updateTimeSheetDetail(this.selectedTimeSheetDetail.timeSheetDetailId, this.selectedTimeSheetDetail).subscribe({
        error: (e) => {
          console.error(e);
        },
        next: (timeSheetDetail) => {
          this.selectedTimeSheetDetail = undefined;
        }
      });
    }
  }

}