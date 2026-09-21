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

    // Get all requests
    getAll(): Observable<Request[]> {
        return this.http.get<Request[]>(this.apiUrl);
    }

    // Get a request by ID
    getById(id: number): Observable<Request> {
        return this.http.get<Request>(`${this.apiUrl}/${id}`);
    }

    // Create a new request
    create(request: Request): Observable<Request> {
        return this.http.post<Request>(this.apiUrl, request);
    }

    // Update a request
    update(id: number, request: Request): Observable<Request> {
        return this.http.put<Request>(`${this.apiUrl}/${id}`, request);
    }

    // Delete a request
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
