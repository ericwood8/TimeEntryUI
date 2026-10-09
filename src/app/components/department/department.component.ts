import { Component, inject } from '@angular/core';
import { Department } from '../../models/department';
import { DepartmentService } from '../../services/department.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudScreen } from '../crud-screen';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [ CommonModule,  FormsModule ],
  templateUrl: './department.component.html',
  styleUrl: './department.component.css'
})
export class DepartmentComponent extends CrudScreen<Department> {
  protected readonly service = inject(DepartmentService);
  protected readonly noun = 'department';
  protected readonly idKey = 'departmentId';

  protected newRow(): Department {
    return { name: '', isDefault: false, isActive: true, teams: [] };
  }

  protected override prepareEdit(copy: Department): Department {
    copy.teams ??= [];   // the server sends null when a department has no teams yet
    return copy;
  }

  //===============================================
  //  Department Teams
  //===============================================

  createTeam(): void {
    const departmentTeam = { departmentTeamId: 0, name: '', isDefault: false, isActive: true, departmentId: this.selectedRow?.departmentId ?? 0 };
    if (this.selectedRow) {
      (this.selectedRow.teams ??= []).push(departmentTeam);
    }
  }

  deleteTeam(index: number) {
    this.selectedRow?.teams?.splice(index, 1);
  }
}
