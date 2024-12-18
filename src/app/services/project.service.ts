import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project';

@Injectable({
    providedIn: 'root',
})
export class ProjectService {
    private apiUrl = 'api/projects'; // Replace with your API URL

    constructor(private http: HttpClient) { }

    // Get all projects
    get(): Observable<Project[]> {
        return this.http.get<Project[]>(this.apiUrl);
    }

    // Get a project by ID
    getById(id: number): Observable<Project> {
        return this.http.get<Project>(`${this.apiUrl}/${id}`);
    }

    // Create a new project
    create(project: Project): Observable<Project> {
        return this.http.post<Project>(this.apiUrl, project);
    }

    // Update a project
    update(id: number, project: Project): Observable<Project> {
        return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
    }

    // Delete a project
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
