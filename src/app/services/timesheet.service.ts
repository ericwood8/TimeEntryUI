import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeSheet } from '../models/timesheet';

@Injectable({
  providedIn: 'root'
})
export class TimeSheetService {
  private apiUrl = 'api/timesheets'; // Replace with your API URL

  constructor(private http: HttpClient) {

  };

  // Get all timesheets
  get(): Observable<TimeSheet[]> {
    return this.http.get<TimeSheet[]>(this.apiUrl);
  }

  // Get a timesheet by ID
  getById(id: number): Observable<TimeSheet> {
    return this.http.get<TimeSheet>(`${this.apiUrl}/${id}`);
  }

  // Create a new timesheet
  create(timeSheet: TimeSheet): Observable<TimeSheet> {
    return this.http.post<TimeSheet>(this.apiUrl, timeSheet);
  }

  // Update a timesheet
  update(id: number, timeSheet: TimeSheet): Observable<TimeSheet> {
    return this.http.put<TimeSheet>(`${this.apiUrl}/${id}`, timeSheet);
  }

  // Delete a timesheet
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}