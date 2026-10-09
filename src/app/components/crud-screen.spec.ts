import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { HolidayComponent } from './holiday/holiday.component';
import { ProjectComponent } from './project/project.component';

describe('the screens built on CrudScreen', () => {
  let http: HttpTestingController;
  let alerts: string[];

  beforeEach(() => {
    localStorage.clear();
    alerts = [];
    spyOn(window, 'alert').and.callFake((m?: string) => { alerts.push(String(m)); });
    spyOn(window, 'confirm').and.returnValue(true);
    TestBed.configureTestingModule({ imports: [HolidayComponent, ProjectComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function holidayScreen() {
    const fixture = TestBed.createComponent(HolidayComponent);
    fixture.detectChanges();
    http.expectOne('api/holidays').flush([{ holidayId: 1, name: 'New Year', date: '2026-01-01T00:00:00', sY_IsoCountry_Alpha3Code: 'USA' }]);
    return fixture.componentInstance;
  }

  it('lists the rows and edits a copy, with the date the date box wants', () => {
    const screen = holidayScreen();
    expect(screen.rows.length).toBe(1);

    screen.edit(screen.rows[0]);
    expect(screen.selectedRow).not.toBe(screen.rows[0]);
    expect(screen.selectedRow!.date).toBe('2026-01-01');
    expect(screen.rows[0].date).toBe('2026-01-01T00:00:00');
  });

  it('adds a row with key 0, then closes the form and reloads', () => {
    const screen = holidayScreen();
    screen.add();
    screen.selectedRow!.name = 'Founders Day';
    screen.submit(screen.selectedRow!);

    const post = http.expectOne({ method: 'POST', url: 'api/holidays' });
    expect(post.request.body.holidayId).toBe(0);
    post.flush({ holidayId: 2 }, { status: 201, statusText: 'Created' });
    expect(screen.selectedRow).toBeNull();
    http.expectOne({ method: 'GET', url: 'api/holidays' }).flush([]);
  });

  it('updates a row that has a key, and keeps the form open with what was typed when the API refuses', () => {
    const screen = holidayScreen();
    screen.edit(screen.rows[0]);
    screen.selectedRow!.name = 'Bad (name)';
    screen.submit(screen.selectedRow!);

    http.expectOne({ method: 'PUT', url: 'api/holidays/1' }).flush({ detail: 'The name has special characters.' }, { status: 400, statusText: 'Bad Request' });
    expect(alerts).toEqual(['The name has special characters.']);
    expect(screen.selectedRow!.name).toBe('Bad (name)');
  });

  it('says what the API said for a duplicate, and falls back to its own words', () => {
    const screen = holidayScreen();
    screen.add();
    screen.submit(screen.selectedRow!);
    http.expectOne({ method: 'POST', url: 'api/holidays' }).flush(null, { status: 422, statusText: 'Unprocessable' });
    expect(alerts).toEqual(['Holiday already exists!']);
  });

  it('reloads when the row is gone (404), and explains a row that is in use (400)', () => {
    const screen = holidayScreen();
    screen.delete(1);
    http.expectOne({ method: 'DELETE', url: 'api/holidays/1' }).flush(null, { status: 400, statusText: 'Bad Request' });
    expect(alerts).toEqual(['It cannot be deleted because it is in use!']);

    screen.delete(1);
    http.expectOne({ method: 'DELETE', url: 'api/holidays/1' }).flush(null, { status: 404, statusText: 'Not Found' });
    expect(alerts[1]).toBe('It no longer exists!');
    http.expectOne({ method: 'GET', url: 'api/holidays' }).flush([]);
  });

  it('searches by name with the API, and shows everything again for an empty search', () => {
    const screen = holidayScreen();
    screen.searchText = ' New ';
    screen.search();
    http.expectOne({ method: 'GET', url: 'api/holidays/New' }).flush([]);
    expect(screen.rows.length).toBe(0);

    screen.searchText = '  ';
    screen.search();
    http.expectOne({ method: 'GET', url: 'api/holidays' }).flush([]);
  });

  it('drops empty task rows before a project is saved, and searches any part of a name among all projects', () => {
    const fixture = TestBed.createComponent(ProjectComponent);
    fixture.detectChanges();
    http.expectOne('api/projects').flush([{ projectId: 1, name: 'Bridge Repair' }, { projectId: 2, name: 'Road' }]);
    const screen = fixture.componentInstance;

    screen.searchText = 'repair';
    screen.search();
    http.expectOne('api/projects').flush([{ projectId: 1, name: 'Bridge Repair' }, { projectId: 2, name: 'Road' }]);
    expect(screen.rows.map(p => p.name)).toEqual(['Bridge Repair']);

    screen.edit(screen.rows[0]);
    screen.addTask();
    screen.selectedRow!.tasks![0].name = 'Paint';
    screen.addTask();   // left empty
    screen.submit(screen.selectedRow!);
    const put = http.expectOne({ method: 'PUT', url: 'api/projects/1' });
    expect(put.request.body.tasks.map((t: { name: string }) => t.name)).toEqual(['Paint']);
    put.flush({});
    http.expectOne('api/projects').flush([]);
  });
});
