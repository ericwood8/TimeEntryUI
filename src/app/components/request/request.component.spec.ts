import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { RequestComponent } from './request.component';

describe('ProjectComponent', () => {
  let component: RequestComponent;
  let fixture: ComponentFixture<RequestComponent>;

  beforeEach(async () => {
    localStorage.clear();   // a saved sort of an earlier test must not decide this one
    await TestBed.configureTestingModule({
      imports: [RequestComponent],
      // the screen's service needs an HttpClient; the testing one never touches the network
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('gets the employee names from the slim lookup, not the full list', () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectNone('api/employees');
    http.expectOne(r => r.url === 'api/employees/lookup').flush([{ employeeId: 1, name: 'Pat' }]);
    expect(component.employeeName(1)).toBe('Pat');
    expect(component.employeeName(99)).toBe('');
  });

  const statuses = [
    { id: 1, name: 'Pending', next: [2, 3, 4] }, { id: 2, name: 'Approved', next: [4, 5, 6] }, { id: 3, name: 'Rejected', next: [] },
    { id: 4, name: 'Canceled', next: [] }, { id: 5, name: 'Reimbursed', next: [6] }, { id: 6, name: 'Voided', next: [] }];

  it('takes the status names and what each can become from the server, and lists what waits for a decision', () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('api/requests/statuses').flush(statuses);
    http.expectOne('api/requests/toapprove').flush([{ requestId: 7, employeeId: 3, sY_RequestStatusTypeId: 1, reason: 'Leave' }]);

    expect(component.statusName(2)).toBe('Approved');
    expect(component.statusName(99)).toBe('');
    expect(component.toApprove.length).toBe(1);
  });

  it('approves by sending the request back with only the status changed, then reloads both lists', () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('api/requests/statuses').flush(statuses);
    http.expectOne('api/requests/toapprove').flush([]);
    const pending = { requestId: 7, employeeId: 3, sY_RequestStatusTypeId: 1, reason: 'Leave', leaveStart: '2030-01-07', leaveEnd: '2030-01-11' };

    component.approve(pending);

    const put = http.expectOne(r => r.method === 'PUT' && r.url === 'api/requests/7');
    expect(put.request.body).toEqual({ ...pending, sY_RequestStatusTypeId: 2 });
    put.flush({});
    http.expectOne('api/requests/toapprove').flush([]);
  });

  it('offers Cancel only on the signed-in person\'s own requests that can still be canceled', () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('api/requests/statuses').flush(statuses);
    (component as unknown as { auth: unknown }).auth = { user: () => ({ employeeId: 3 }) };

    expect(component.canCancel({ requestId: 1, employeeId: 3, sY_RequestStatusTypeId: 1 })).toBe(true);
    expect(component.canCancel({ requestId: 2, employeeId: 4, sY_RequestStatusTypeId: 1 })).toBe(false);
    expect(component.canCancel({ requestId: 3, employeeId: 3, sY_RequestStatusTypeId: 3 })).toBe(false);
  });

  it('clears the sort: newest first again, the saved sort forgotten, back to the first page', () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(r => r.url === 'api/requests').flush({ pageIndex: 0, count: 30, data: [] });

    component.sortBy('reason');
    expect(localStorage.getItem('gridSort:request')).toBe('reason:asc');
    http.expectOne(r => r.url === 'api/requests').flush({ pageIndex: 0, count: 30, data: [] });

    component.currentPage = 3;
    component.sortMenu = { x: 10, y: 10 };
    component.clearSort();

    const req = http.expectOne(r => r.url === 'api/requests');
    expect(req.request.params.get('sort')).toBe('whenRequested:desc');
    expect(req.request.params.get('pageIndex')).toBe('0');
    expect(localStorage.getItem('gridSort:request')).toBeNull();
    expect(component.sortMenu).toBeNull();
    req.flush({ pageIndex: 0, count: 30, data: [] });
  });

  it('asks the server for the first page, newest first', () => {
    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne(r => r.url === 'api/requests');
    expect(req.request.params.get('pageIndex')).toBe('0');
    expect(req.request.params.get('pageSize')).toBe('5');
    expect(req.request.params.get('sort')).toBe('whenRequested:desc');
    req.flush({ pageIndex: 0, count: 12, data: [{ requestId: 1, employeeId: 1, reason: 'Leave' }] });
    expect(component.total).toBe(12);
    expect(component.rows.length).toBe(1);
  });

  it('sorts on the server, reversing on a second click, and searches from the first page', () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(r => r.url === 'api/requests').flush({ pageIndex: 0, count: 0, data: [] });

    component.sortBy('reason');
    http.expectOne(r => r.url === 'api/requests' && r.params.get('sort') === 'reason:asc').flush({ pageIndex: 0, count: 0, data: [] });
    component.sortBy('reason');
    http.expectOne(r => r.url === 'api/requests' && r.params.get('sort') === 'reason:desc').flush({ pageIndex: 0, count: 0, data: [] });

    component.currentPage = 3;
    component.searchText = ' leave ';
    component.search();
    const req = http.expectOne(r => r.url === 'api/requests');
    expect(req.request.params.get('pageIndex')).toBe('0');
    expect(req.request.params.get('search')).toBe('leave');
    req.flush({ pageIndex: 0, count: 0, data: [] });
  });
});
