import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Request } from '../models/request';
import { PageQuery, Paginated, pageParams } from '../models/paginated';
import { CrudService } from './crud.service';

@Injectable({
    providedIn: 'root',
})
export class RequestService extends CrudService<Request> {
    constructor(http: HttpClient) {
        super(http, 'api/requests');
    }

    // Get one page of requests, sorted and filtered by the server
    getPage(query: PageQuery): Observable<Paginated<Request>> {
        return this.http.get<Paginated<Request>>(this.apiUrl, { params: pageParams(query) });
    }
}
