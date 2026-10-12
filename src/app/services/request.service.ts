import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Request } from '../models/request';
import { RequestStatus } from '../models/request-status';
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

    // Every status with the ones it can move to: the one list the server keeps
    getStatuses(): Observable<RequestStatus[]> {
        return this.http.get<RequestStatus[]>(`${this.apiUrl}/statuses`);
    }

    // The pending requests waiting for the signed-in person's decision
    getToApprove(): Observable<Request[]> {
        return this.http.get<Request[]>(`${this.apiUrl}/toapprove`);
    }

    // A decision: the request as it is, with only the status changed
    setStatus(request: Request, statusId: number): Observable<Request> {
        return this.update(request.requestId!, { ...request, sY_RequestStatusTypeId: statusId });
    }
}
