import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TimesheetdetailComponent } from './timesheetdetail.component';

describe('TimesheetdetailComponent', () => {
  let component: TimesheetdetailComponent;
  let fixture: ComponentFixture<TimesheetdetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetdetailComponent],
      // the screen's service needs an HttpClient; the testing one never touches the network
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
