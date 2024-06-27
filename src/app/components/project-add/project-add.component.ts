import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-project-add',
  templateUrl: './project-add.component.html',
  styleUrls: ['./project-add.component.css']
})
export class ProjectAddComponent {
  colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'black', 'white'];

  newProject: Project = {
    id: this.generateId(),
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    color: 'white',
    tasks: []
  };

  constructor(
    public dialogRef: MatDialogRef<ProjectAddComponent>,
    private projectService: ProjectService
  ) {}

  saveProject() {
    this.projectService.addProject(this.newProject);
    this.dialogRef.close(this.newProject);
  }

  cancel() {
    this.dialogRef.close();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
