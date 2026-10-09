import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeLookup } from '../models/employee';
import { NamedCrudService } from './crud.service';

@Injectable({
    providedIn: 'root',
})
export class EmployeeService extends NamedCrudService<Employee> {
    constructor(http: HttpClient) {
        super(http, 'api/employees');
    }

    // Get just the id and the name of the active employees: for drop-downs and name columns (a fraction of getAll(), which carries manager, department and team)
    getLookup(): Observable<EmployeeLookup[]> {
        return this.http.get<EmployeeLookup[]>(`${this.apiUrl}/lookup`);
    }
}
