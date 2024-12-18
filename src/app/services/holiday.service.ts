import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Holiday } from '../models/holiday';

@Injectable({
    providedIn: 'root',
})
export class HolidayService {
    private apiUrl = 'api/holidays'; // Replace with your API URL

    constructor(private http: HttpClient) { }

    // Get all holidays
    getAll(): Observable<Holiday[]> {
        return this.http.get<Holiday[]>(this.apiUrl);
    }

    // Get a holiday by ID
    getById(id: number): Observable<Holiday> {
        return this.http.get<Holiday>(`${this.apiUrl}/${id}`);
    }

    // Create a new holiday
    create(holiday: Holiday): Observable<Holiday> {
        return this.http.post<Holiday>(this.apiUrl, holiday);
    }

    // Update a holiday
    update(id: number, holiday: Holiday): Observable<Holiday> {
        return this.http.put<Holiday>(`${this.apiUrl}/${id}`, holiday);
    }

    // Delete a holiday
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Find by Name
    findByName(name: string): Observable<Holiday[]> {
        return this.http.get<Holiday[]>(`${this.apiUrl}/${name}`);
    }
}