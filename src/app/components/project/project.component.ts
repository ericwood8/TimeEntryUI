import { ChangeDetectorRef, Component } from '@angular/core';
import { Project, ProjectTask } from '../../models/project';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatPaginatorModule ],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css'
})
export class ProjectComponent {

  pageSize = 10; // Default page size
  currentPage = 0;
  allProjects: Project[] = [];
  projects: Project[] = [];
  paginatedProjects: Project[] = [];
  selectedRow: Project | null = null;
  searchText!: string;

  constructor(private projectService: ProjectService, private changeRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.projectService.get().subscribe((data) => {
      this.allProjects = this.projects = data;
      this.paginatedProjects = this.projects.slice(0, this.pageSize);
    });
  }

  search() {
    if (this.searchText && this.searchText != "") {
      this.paginatedProjects = this.projects = this.allProjects.filter(p => p.name?.toLowerCase().includes(this.searchText.toLowerCase()));
    }
    else {
      this.load();
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  private updatePagination(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProjects = this.projects.slice(startIndex, endIndex);
  }

  submit(project: Project): void {
    project.tasks = project.tasks?.filter(t => t.name && t.name != "");
    if (project.projectId) {
      // Edit
      this.projectService.update(project.projectId, project).subscribe(() => {
        console.log("Updated successfully!");
        this.selectedRow = null;
        this.load();
      }, (error) => {
        if (error.status == 400) { alert("Name is bad or has special characters!"); }
        else if (error.status == 422) { alert("Project already exists!"); }
        else {
          alert("Problem while updating!");
          console.log("Problem while updating!");
        }
      });
    }
    else {
      // Add
      project.projectId = 0;
      this.projectService.create(project).subscribe((project) => {
        this.projects.push(project);
        this.selectedRow = null;
      }, (error) => {
        if (error.status == 400) { alert("Name is bad or has special characters!"); }
        else if(error.status == 422){ alert("Project already exists!"); }
        else {alert("Problem while adding! " + error.message); }
      });
    }
  }

  delete(id: number): void {
    if (confirm("Are you sure you want to delete this?")) {
      this.projectService.delete(id).subscribe(() => {
        console.log("Delete successfully!");
        this.projects = this.allProjects.filter((p) => p.projectId !== id);
        this.updatePagination();
        this.changeRef.detectChanges();
      }, (error) => {
        alert("Sorry, you can not delete this record.");
        console.log("Problem while deleting!");
      });
    }
  }

  add(): void {
    this.selectedRow = { name: '', isDefault: true, isActive: true, tasks: [] };
  }

  edit(project: Project): void {
    this.selectedRow = { ...project };
    if (!this.selectedRow.tasks || this.selectedRow.tasks?.length < 1) {
      this.selectedRow.tasks = [];
    }
  }

  cancel(): void {
    this.selectedRow = null;
  }

  //===============================================
  //  Project Tasks 
  //===============================================

  addTask(): void {
    const projectTask = { projectTaskId: 0, name: '', projectId: this.selectedRow?.projectId ?? 0, isDefault: true, isActive: true };
    this.selectedRow?.tasks.push(projectTask);
    console.log(this.selectedRow?.tasks);
  }

  deleteTask(index: number) {
    this.selectedRow?.tasks.splice(index, 1);
  }
}
