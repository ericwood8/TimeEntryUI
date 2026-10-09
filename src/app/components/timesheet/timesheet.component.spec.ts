import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TimeSheetComponent } from './timesheet.component';

describe('TimegridComponent', () => {
  let component: TimeSheetComponent;
  let fixture: ComponentFixture<TimeSheetComponent>;

  beforeEach(async () => {
    localStorage.clear();   // a saved sort of an earlier test must not decide this one
    await TestBed.configureTestingModule({
      imports: [TimeSheetComponent],
      // the screen's service needs an HttpClient; the testing one never touches the network
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('asks the server for a page of time sheets once the employees are in', () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(r => r.url === 'api/employees/lookup').flush([{ employeeId: 7, name: 'Pat' }]);
    const req = http.expectOne(r => r.url === 'api/timesheets');
    expect(req.request.params.get('pageIndex')).toBe('0');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('sort')).toBe('whenEntered:desc');
    req.flush({ pageIndex: 0, count: 31, data: [{ timeSheetId: 1, employeeId: 7, notes: 'x' }] });
    expect(component.total).toBe(31);
    expect(component.rows[0].employee?.name).toBe('Pat');
  });

  it('never loads the full employee list for the names', () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectNone('api/employees');
    http.expectOne(r => r.url === 'api/employees/lookup').flush([]);
  });

  it('clears the sort: newest first again, the saved sort forgotten, back to the first page', () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(r => r.url === 'api/employees/lookup').flush([]);
    http.expectOne(r => r.url === 'api/timesheets').flush({ pageIndex: 0, count: 30, data: [] });

    component.sortBy('notes');
    expect(localStorage.getItem('gridSort:timesheet')).toBe('notes:asc');
    http.expectOne(r => r.url === 'api/timesheets').flush({ pageIndex: 0, count: 30, data: [] });

    component.currentPage = 2;
    component.sortMenu = { x: 10, y: 10 };
    component.clearSort();

    const req = http.expectOne(r => r.url === 'api/timesheets');
    expect(req.request.params.get('sort')).toBe('whenEntered:desc');
    expect(req.request.params.get('pageIndex')).toBe('0');
    expect(localStorage.getItem('gridSort:timesheet')).toBeNull();
    expect(component.sortMenu).toBeNull();
    req.flush({ pageIndex: 0, count: 30, data: [] });
  });

  it('goes back a page when the page it asked for is past the end', () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(r => r.url === 'api/employees/lookup').flush([]);
    http.expectOne(r => r.url === 'api/timesheets').flush({ pageIndex: 0, count: 0, data: [] });
    component.currentPage = 2;
    component.onPageChange({ pageIndex: 2, pageSize: 10, length: 25 });
    http.expectOne(r => r.url === 'api/timesheets' && r.params.get('pageIndex') === '2').flush({ pageIndex: 2, count: 20, data: [] });
    http.expectOne(r => r.url === 'api/timesheets' && r.params.get('pageIndex') === '1').flush({ pageIndex: 1, count: 20, data: [{ timeSheetId: 2, employeeId: 7 }] });
    expect(component.currentPage).toBe(1);
    expect(component.rows.length).toBe(1);
  });
});
