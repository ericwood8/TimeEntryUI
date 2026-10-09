import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeSheet } from '../models/timesheet';
import { PageQuery, Paginated, pageParams } from '../models/paginated';
import { CrudService } from './crud.service';

@Injectable({
    providedIn: 'root',
})
export class TimeSheetService extends CrudService<TimeSheet> {
    constructor(http: HttpClient) {
        super(http, 'api/timesheets');
    }

    // Get one page of time sheets, sorted and filtered by the server
    getPage(query: PageQuery): Observable<Paginated<TimeSheet>> {
        return this.http.get<Paginated<TimeSheet>>(this.apiUrl, { params: pageParams(query) });
    }
}
