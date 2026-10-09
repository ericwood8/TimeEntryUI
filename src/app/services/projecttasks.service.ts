import { Injectable } from '@angular/core';
import { ProjectTask } from '../models/project';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NamedCrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectTasksService extends NamedCrudService<ProjectTask> {
  constructor(http: HttpClient) {
    super(http, 'api/projecttasks');
  }

  // The tasks of one project
  getProjectTasks(id: number): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.apiUrl}/project/${id}`);
  }
}
