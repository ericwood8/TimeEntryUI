import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee';

@Injectable({
    providedIn: 'root',
})
export class EmployeeService {
    private apiUrl = 'api/employees'; // Replace with your API URL

    constructor(private http: HttpClient) { }

    // Get all employees
    getAll(): Observable<Employee[]> {
        return this.http.get<Employee[]>(this.apiUrl);
    }

    // Get a employee by ID
    getById(id: number): Observable<Employee> {
        return this.http.get<Employee>(`${this.apiUrl}/${id}`);
    }

    // Create a new employee
    create(employee: Employee): Observable<Employee> {
        return this.http.post<Employee>(this.apiUrl, employee);
    }

    // Update a employee
    update(id: number, employee: Employee): Observable<Employee> {
        return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
    }

    // Delete a employee
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Find by Name
    findByName(name: string): Observable<Employee[]> {
        return this.http.get<Employee[]>(`${this.apiUrl}/${name}`);
    }
}