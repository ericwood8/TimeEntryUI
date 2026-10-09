import { Component, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Project } from '../../models/project';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CrudScreen } from '../crud-screen';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatPaginatorModule ],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css'
})
export class ProjectComponent extends CrudScreen<Project> {
  protected readonly service = inject(ProjectService);
  protected readonly noun = 'project';
  protected readonly idKey = 'projectId';

  // the list is small, so the page is cut here, from all the rows
  pageSize = 10;
  currentPage = 0;

  get paginatedRows(): Project[] {
    return this.rows.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  /** A project is found by any part of its name, among all the projects. */
  protected override find(text: string): Observable<Project[]> {
    return this.service.getAll().pipe(map((all) => all.filter((p) => p.name?.toLowerCase().includes(text.toLowerCase()))));
  }

  override search(): void {
    this.currentPage = 0;
    super.search();
  }

  protected newRow(): Project {
    return { name: '', isDefault: true, isActive: true, tasks: [] };
  }

  protected override prepare(project: Project): void {
    project.tasks = project.tasks?.filter(t => t.name && t.name != "");
  }

  protected override prepareEdit(copy: Project): Project {
    copy.tasks ??= [];   // the server sends null when a project has no tasks yet
    return copy;
  }

  //===============================================
  //  Project Tasks
  //===============================================

  addTask(): void {
    const projectTask = { projectTaskId: 0, name: '', projectId: this.selectedRow?.projectId ?? 0, isDefault: true, isActive: true };
    if (this.selectedRow) {
      (this.selectedRow.tasks ??= []).push(projectTask);
    }
  }

  deleteTask(index: number) {
    this.selectedRow?.tasks?.splice(index, 1);
  }
}
