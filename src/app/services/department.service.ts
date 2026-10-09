import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department, DepartmentTeam } from '../models/department';
import { NamedCrudService } from './crud.service';

@Injectable({
    providedIn: 'root',
})
export class DepartmentService extends NamedCrudService<Department> {
    private teamUrl = 'api/departmentteams/department';

    constructor(http: HttpClient) {
        super(http, 'api/departments');
    }

    // Special - Get all teams of department
    public getTeams(id: number): Observable<DepartmentTeam[]> {
        return this.http.get<DepartmentTeam[]>(`${this.teamUrl}/${id}`);
    }
}
