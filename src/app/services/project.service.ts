import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project } from '../models/project';
import { NamedCrudService } from './crud.service';

@Injectable({
    providedIn: 'root',
})
export class ProjectService extends NamedCrudService<Project> {
    constructor(http: HttpClient) {
        super(http, 'api/projects');
    }
}
