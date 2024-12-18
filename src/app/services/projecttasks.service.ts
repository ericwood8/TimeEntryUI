import { Injectable } from '@angular/core';
import { ProjectTask } from '../models/project';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectTasksService {
  private apiUrl = 'api/projecttasks'; // Replace with your API URL

  constructor(private http: HttpClient) { }

  // Get all projects
  get(): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(this.apiUrl);
  }

  getProjectTasks(id: number): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.apiUrl}/project/${id}`);
  }

  // Get a project by ID
  getById(id: number): Observable<ProjectTask> {
    return this.http.get<ProjectTask>(`${this.apiUrl}/${id}`);
  }

  // Create a new project
  create(project: ProjectTask): Observable<ProjectTask> {
    return this.http.post<ProjectTask>(this.apiUrl, project);
  }

  // Update a project
  update(id: number, project: ProjectTask): Observable<ProjectTask> {
    return this.http.put<ProjectTask>(`${this.apiUrl}/${id}`, project);
  }

  // Delete a project
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}