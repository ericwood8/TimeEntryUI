import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ProjectService } from './project.service';
import { TimeSheetDetailService } from './timesheetdetail.service';
import { DepartmentService } from './department.service';
import { ProjectTasksService } from './projecttasks.service';
import { Project } from '../models/project';

describe('the services built on CrudService', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const project: Project = { projectId: 7, name: 'Alpha', isActive: true, isDefault: false };

  it('calls the five routes of its table', () => {
    const service = TestBed.inject(ProjectService);

    service.getAll().subscribe();
    http.expectOne({ method: 'GET', url: 'api/projects' }).flush([]);

    service.getById(7).subscribe();
    http.expectOne({ method: 'GET', url: 'api/projects/7' }).flush(project);

    service.create(project).subscribe();
    const create = http.expectOne({ method: 'POST', url: 'api/projects' });
    expect(create.request.body).toEqual(project);
    create.flush(project);

    service.update(7, project).subscribe();
    const update = http.expectOne({ method: 'PUT', url: 'api/projects/7' });
    expect(update.request.body).toEqual(project);
    update.flush(project);

    service.delete(7).subscribe();
    http.expectOne({ method: 'DELETE', url: 'api/projects/7' }).flush(null);
  });

  it('finds by name with the name encoded, so a space or a slash cannot change the route', () => {
    TestBed.inject(ProjectService).findByName('Big Project/2').subscribe();

    http.expectOne({ method: 'GET', url: 'api/projects/Big%20Project%2F2' }).flush([]);
  });

  it('keeps the calls that are a table\'s own', () => {
    TestBed.inject(DepartmentService).getTeams(3).subscribe();
    http.expectOne({ method: 'GET', url: 'api/departmentteams/department/3' }).flush([]);

    TestBed.inject(ProjectTasksService).getProjectTasks(4).subscribe();
    http.expectOne({ method: 'GET', url: 'api/projecttasks/project/4' }).flush([]);

    TestBed.inject(TimeSheetDetailService).getOfTimeSheet(9).subscribe();
    http.expectOne({ method: 'GET', url: 'api/timesheetDetails/timeSheet/9' }).flush([]);
  });
});
