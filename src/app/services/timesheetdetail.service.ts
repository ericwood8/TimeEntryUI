import { Injectable } from '@angular/core';
import { TimeSheetDetail } from '../models/timesheetdetail';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeSheetDetailService {

  private apiUrl = 'api/timesheetDetails'; // Replace with your API URL

  constructor(private http: HttpClient) {
    
  };

  // Get a project by ID
  getTimeSheetDetailById(id: number): Observable<TimeSheetDetail[]> {
    return this.http.get<TimeSheetDetail[]>(`${this.apiUrl}/timeSheet/${id}`);
  }

  // Create a new project
  createTimeSheetDetail(timeSheetDetail: TimeSheetDetail): Observable<TimeSheetDetail> {
    return this.http.post<TimeSheetDetail>(this.apiUrl, timeSheetDetail);
  }

  // Update a project
  updateTimeSheetDetail(id: number, timeSheetDetail: TimeSheetDetail): Observable<TimeSheetDetail> {
    return this.http.put<TimeSheetDetail>(`${this.apiUrl}/${id}`, timeSheetDetail);
  }

  // Delete a project
  deleteTimeSheetDetail(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
