import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department, DepartmentTeam } from '../models/department';

@Injectable({
    providedIn: 'root',
})
export class DepartmentService {
    private apiUrl = 'api/departments'; // Replace with your API URL
    private teamUrl = 'api/departmentteams/department';

    constructor(private http: HttpClient) { }

    // Get all
    getAll(): Observable<Department[]> {
        return this.http.get<Department[]>(this.apiUrl);
    }

    // Get by ID
    getById(id: number): Observable<Department> {
        return this.http.get<Department>(`${this.apiUrl}/${id}`);
    }

    // Create 
    create(department: Department): Observable<Department> {
        return this.http.post<Department>(this.apiUrl, department);
    }

    // Update 
    update(id: number, department: Department): Observable<Department> {
        return this.http.put<Department>(`${this.apiUrl}/${id}`, department);
    }

    // Delete 
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Find by Name
    findByName(name: string): Observable<Department[]> {
        return this.http.get<Department[]>(`${this.apiUrl}/${name}`);
    }

    // Special - Get all teams of department
    public getTeams(id: number): Observable<DepartmentTeam[]> {
        return this.http.get<DepartmentTeam[]>(`${this.teamUrl}/${id}`); 
    }
}