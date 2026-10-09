import { Injectable } from '@angular/core';
import { TimeSheetDetail } from '../models/timesheetdetail';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class TimeSheetDetailService extends CrudService<TimeSheetDetail> {
  constructor(http: HttpClient) {
    super(http, 'api/timesheetDetails');
  }

  // The details of one time sheet (there is no list of all of them)
  getOfTimeSheet(timeSheetId: number): Observable<TimeSheetDetail[]> {
    return this.http.get<TimeSheetDetail[]>(`${this.apiUrl}/timeSheet/${timeSheetId}`);
  }
}
