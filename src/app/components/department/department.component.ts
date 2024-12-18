import { Component } from '@angular/core';
import { Department, DepartmentTeam } from '../../models/department';
import { DepartmentService } from '../../services/department.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [ CommonModule,  FormsModule ],
  templateUrl: './department.component.html',
  styleUrl: './department.component.css'
})

export class DepartmentComponent {
  departments: Department[] = [];
  selectedRow: Department | null = null;
  searchText = '';

  constructor(private departmentService: DepartmentService) { }

  ngOnInit(): void {
    this.loadDepartments();
  }

  private loadDepartments(): void {
    this.departmentService.getAll().subscribe((data) => {
      this.departments = data;
    });
  }

  submitDepartment(department: Department): void {
    if (department.departmentId) {
      // Edit
      this.departmentService.update(department.departmentId, department).subscribe(() => {
        console.log("Updated successfully!");
        this.loadDepartments();
      }, (error) => {
        if (error.status == 400) { alert("Name is bad or has special characters!"); }
        else if (error.status == 422) { alert("Department already exists!"); }
        else {
          alert("Problem while updating!");
          console.log("Problem while updating!");
        }
      });
    }
    else {
      // Create
      department.departmentId = 0;
      this.departmentService.create(department).subscribe((department) => { this.departments.push(department); },
        (error) => {
          if (error.status == 400) { alert("Name is bad or has special characters!"); }
          else if (error.status == 422) { alert("Department already exists!"); }
          else { console.log("Problem while editing!", error.message); }
        });
    }
    this.selectedRow = null;
  }

  deleteDepartment(id: number): void {
    if(confirm("Are you sure you want to delete?")){
      this.departmentService.delete(id).subscribe(() => {
        console.log("Delete successfully!");
        this.departments = this.departments.filter((p) => p.departmentId !== id);
      }, (error) => { console.log("Problem while deleting!"); });
    }
  }

  
  editDepartment(department: Department): void {
    this.selectedRow = { ...department };
    if(!this.selectedRow.teams || this.selectedRow.teams?.length < 1){
      this.selectedRow.teams = [];
    }
  }


  newDepartment(): void {
    this.selectedRow = { name:'', isDefault: false, isActive: true, teams: [] };
  }

  
  cancelDepartment(): void {
    this.selectedRow = null;
  }

  searchDepartment(): void {
    this.selectedRow = null;

    this.departmentService.findByName(this.searchText)
      .subscribe({
        next: (data) => {
          this.departments = data;
          console.log(data);
        },
        error: (e) => console.error(e)
      });
  }

  //===============================================
  //  Department Teams 
  //===============================================
  
  createTeam(): void {
    const departmentTeam = { departmentTeamId: 0, name: '', isDefault: false, isActive: true, departmentId: this.selectedRow?.departmentId ?? 0};
    this.selectedRow?.teams.push(departmentTeam);
    console.log(this.selectedRow?.teams);
  }

  deleteTeam(index: number) {
    this.selectedRow?.teams.splice(index, 1);
  }
}