import { Component, inject } from '@angular/core';
import { Employee } from '../../models/employee';
import { Department, DepartmentTeam } from '../../models/department';
import { EmployeeService } from '../../services/employee.service';
import { CountryService } from '../../services/country.service';
import { Country } from '../../models/country';
import { DepartmentService } from '../../services/department.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudScreen } from '../crud-screen';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent extends CrudScreen<Employee> {
  protected readonly service = inject(EmployeeService);
  protected readonly noun = 'employee';
  protected readonly idKey = 'employeeId';
  private readonly departmentService = inject(DepartmentService);
  private readonly countryService = inject(CountryService);

  departments: Department[] = [];
  filteredTeams: DepartmentTeam[] = [];
  managers: Employee[] = [];
  countries: Country[] = [];

  protected override start(): void {
    super.start();
    this.service.getAll().subscribe((data) => { this.managers = data; });
    this.departmentService.getAll().subscribe(value => this.departments = value);
    this.countryService.getAll().subscribe(value => this.countries = value);
  }

  /** The country's name for the grid; the code itself when the list has not arrived or does not hold it. */
  countryName(code?: string): string {
    return this.countries.find(c => c.alpha3Code === code)?.name ?? code ?? '';
  }

  protected newRow(): Employee {
    return { name: '', isActive: true, departmentId: 0, departmentTeamId: 0, sY_IsoCountry_Alpha3Code: 'USA', availableLeaveHours: 0, donatedHrsReceived: 0, employeeId: 0 };
  }

  protected override prepareEdit(copy: Employee): Employee {
    // so the team drop-down holds the teams of the employee's department
    if (copy.departmentId != null && copy.departmentTeamId != null) {
      this.onDepartmentSelect(copy.departmentId);
    }
    return copy;
  }

  onDepartmentSelect(departmentId: number) {
    this.departmentService.getTeams(departmentId).subscribe(data => { this.filteredTeams = data; });
  }

  onTeamSelect(departmentTeamId: number) {
    if (this.selectedRow != null) {
      this.selectedRow.departmentTeamId = departmentTeamId;
    }
  }
}
