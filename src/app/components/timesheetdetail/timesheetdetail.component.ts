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
    const timeSheetId = this.selectedTimeSheet()?.timeSheetId;
    if (timeSheetId == undefined) {
      this.timeSheetDetails = [];
      return;
    }
    this.timeSheetDetailService.getTimeSheetDetailById(timeSheetId).subscribe({
      error: (e) => {
        console.error(e);
      },
      next: (timeSheetDetails) => {
        this.timeSheetDetails = timeSheetDetails;
      }
    });
  }

  public getProjects() {
    this.projectService.getAll().subscribe(value => this.projects = value);
  }

  public onProjectSelect(id: number) {
    this.projectTaskService.getProjectTasks(id).subscribe(value => this.projectTasks = value);
  }

  public selectTimeSheetDetail(timeSheetDetail: TimeSheetDetail) {
    // edit a COPY: changing the row itself would change what the grid shows
    this.selectedTimeSheetDetail = { ...timeSheetDetail };
    if (timeSheetDetail.projectId != undefined) {
      this.onProjectSelect(timeSheetDetail.projectId); // the task list must hold this project's tasks for the drop-down to show the saved one
    }
  }

  public deleteTimeSheetDetail(timeSheetDetail: TimeSheetDetail) {
    if (timeSheetDetail.timeSheetDetailId == undefined || !confirm("Are you sure you want to delete this detail?")) {
      return;
    }
    this.timeSheetDetailService.deleteTimeSheetDetail(timeSheetDetail.timeSheetDetailId).subscribe({
      next: () => {
        this.timeSheetDetails = this.timeSheetDetails.filter(d => d.timeSheetDetailId !== timeSheetDetail.timeSheetDetailId);
      },
      error: (e) => {
        alert(e.status == 400 ? "It cannot be deleted because it is in use!" : "Problem while deleting!");
        console.error(e);
      }
    });
  }

  public newTimeSheetDetail() {
    this.selectedTimeSheetDetail = {
      timeSheetDetailId: undefined,
      e_TimeSheetId: undefined,
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
    // the names come from the server; only the ids are saved
    const detail: TimeSheetDetail = { ...timeSheetDetail, e_TimeSheetId: this.selectedTimeSheet()?.timeSheetId };
    const saved = {
      error: (e: unknown) => {
        console.error(e);
      },
      next: () => {
        this.selectedTimeSheetDetail = undefined;
        this.getTimeSheetDetails(); // show what the server now holds, including the names
      }
    };
    //New detail
    if (detail.timeSheetDetailId == undefined) {
      detail.timeSheetDetailId = 0;
      this.timeSheetDetailService.createTimeSheetDetail(detail).subscribe(saved);
    }
    //existing detail
    else {
      this.timeSheetDetailService.updateTimeSheetDetail(detail.timeSheetDetailId, detail).subscribe(saved);
    }
  }

}
