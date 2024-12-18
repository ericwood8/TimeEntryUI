import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetdetailComponent } from './timesheetdetail.component';

describe('TimesheetdetailComponent', () => {
  let component: TimesheetdetailComponent;
  let fixture: ComponentFixture<TimesheetdetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetdetailComponent]
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
