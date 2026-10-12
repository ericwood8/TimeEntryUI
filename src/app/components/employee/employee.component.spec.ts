import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EmployeeComponent } from './employee.component';

describe('EmployeeComponent', () => {
  let component: EmployeeComponent;
  let fixture: ComponentFixture<EmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeComponent],
      // the screen's service needs an HttpClient; the testing one never touches the network
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lists the countries for the drop-down, shows a name in the grid and starts a new employee in the USA', () => {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('api/countries').flush([{ alpha3Code: 'USA', name: 'United States' }, { alpha3Code: 'CAN', name: 'Canada' }]);

    expect(component.countryName('CAN')).toBe('Canada');
    expect(component.countryName('ZZZ')).toBe('ZZZ');
    component.add();
    expect(component.selectedRow?.sY_IsoCountry_Alpha3Code).toBe('USA');
  });
});