import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Request } from '../models/request';

@Injectable({
    providedIn: 'root',
})
export class RequestService {
    private apiUrl = 'api/requests'; // Replace with your API URL

    constructor(private http: HttpClient) { }

    // Get all Requests
    get(): Observable<Request[]> {
        return this.http.get<Request[]>(this.apiUrl);
    }

    // Get a Request by ID
    getById(id: number): Observable<Request> {
        return this.http.get<Request>(`${this.apiUrl}/${id}`);
    }

    // Create a new Request
    create(Request: Request): Observable<Request> {
        return this.http.post<Request>(this.apiUrl, Request);
    }

    // Update a Request
    update(id: number, Request: Request): Observable<Request> {
        return this.http.put<Request>(`${this.apiUrl}/${id}`, Request);
    }

    // Delete a Request
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
