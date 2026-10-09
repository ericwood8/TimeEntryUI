import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'TimeEntryUI' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('TimeEntryUI');
  });

  it('shows only the page (no header or sidebar) when nobody is signed in', () => {
    sessionStorage.removeItem('timeentry.auth');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeNull();
    expect(compiled.querySelector('app-sidebar')).toBeNull();
  });

  it('shows the header and the sidebar when someone is signed in', () => {
    sessionStorage.setItem('timeentry.auth', JSON.stringify({
      token: 'test', expiresUtc: new Date(Date.now() + 3600_000).toISOString(),
      user: { timeEntryUserId: 1, name: 'Tester', sY_RoleId: 1, sY_Role: 1, isActive: true },
    }));
    try {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [AppComponent],
        providers: [provideRouter([]), provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting()],
      });
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-header')).toBeTruthy();
      expect(compiled.querySelector('app-sidebar')).toBeTruthy();
    } finally {
      sessionStorage.removeItem('timeentry.auth');
    }
  });
});
