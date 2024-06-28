import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; // 追加
import { FormsModule } from '@angular/forms'; // 追加
import { Project } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule] // 追加
})
export class ProjectDetailComponent {
  project: Project;
  colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'black', 'white'];

  constructor(
    public dialogRef: MatDialogRef<ProjectDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: Project },
    private projectService: ProjectService
  ) {
    this.project = data.project;
  }

  updateProject() {
    this.projectService.updateProject(this.project).then(() => {
      this.dialogRef.close(this.project);
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
