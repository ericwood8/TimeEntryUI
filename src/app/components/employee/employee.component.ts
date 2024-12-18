import { Component } from '@angular/core';
import { Employee } from '../../models/employee';
import { Department,DepartmentTeam } from '../../models/department';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})

export class EmployeeComponent {
  departments: Department[] = [];
  filteredTeams  : DepartmentTeam[] = [];
  employees: Employee[] = [];
  managers: Employee[] = [];
  selectedRow: Employee | null = null;
  searchText = '';

  constructor(private employeeService: EmployeeService, private departmentService: DepartmentService) { }

  ngOnInit(): void {
    this.loadEmployees();
    this.employeeService.getAll().subscribe((data) => { this.managers = data; });
    this.departmentService.getAll().subscribe(value => this.departments = value);
  }

  private loadEmployees(): void {
    this.employeeService.getAll().subscribe((data) => { this.employees = data; });
  }

  submit(employee: Employee): void {

    if (employee.employeeId) {
      // edit
      this.employeeService.update(employee.employeeId, employee).subscribe(() => {
        console.log("Edited successfully!");
        this.loadEmployees();
      }, (error) => {
        if (error.status == 400) { alert("Name is bad or has special characters!"); }
        else if (error.status == 422) { alert("Employee already exists!"); }
        else {
          alert("Problem while updating!");
          console.log("Problem while updating!");
        }
      });
    }
    else {
      // add
      employee.employeeId = 0;
      console.log(employee.departmentTeamId);
      this.employeeService.create(employee).subscribe((employee) => { this.employees.push(employee); },
        (error) => {
          if (error.status == 400) { alert("Name is bad or has special characters!"); }
          else if (error.status == 422) { alert("Employee already exists!"); }
          else { console.log("Problem while adding!", error.message); }
        });
    }
    this.selectedRow = null;
  }

  delete(id: number): void {
    if(confirm("Are you sure you want to delete?")){
      this.employeeService.delete(id).subscribe(() => {
        console.log("Delete successfully!");
        this.employees = this.employees.filter((p) => p.employeeId !== id);
      }, (error) => { console.log("Problem while deleting!"); });
    }
  }

  add(): void {
    this.selectedRow = { name:'', isActive: true, departmentId: 0, departmentTeamId: 0, availableLeaveHours: 0, 
        donatedHrsReceived: 0, employeeId: 0 };
  }

  edit(employee: Employee): void {
    this.selectedRow = { ...employee };

    // Fix so loads Teams on edit
    if (this.selectedRow != null) {
      if (this.selectedRow.departmentId != null && this.selectedRow.departmentTeamId != null)
      {
        this.departmentService.getTeams(this.selectedRow.departmentId).subscribe(data => { this.filteredTeams = data; });
      }
    }
  }

  cancel(): void {
    this.selectedRow = null;
  }

  onDepartmentSelect(departmentId: number) {
    this.departmentService.getTeams(departmentId).subscribe(data => { this.filteredTeams = data; });
  }

  onTeamSelect(departmentTeamId: number) {
    if (this.selectedRow != null) {
      this.selectedRow.departmentTeamId = departmentTeamId;  
    }    
  }

  search(): void {
    this.selectedRow = null;

    this.employeeService.findByName(this.searchText)
      .subscribe({
        next: (data) => {
          this.employees = data;
          console.log(data);
        },
        error: (e) => console.error(e)
      });
  }  
}