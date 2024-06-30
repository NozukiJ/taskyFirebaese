import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';
import { UserSearchComponent } from '../user-search/user-search.component';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, UserSearchComponent]
})
export class ProjectDetailComponent implements OnInit {
  project: Project;
  members: User[] = [];
  colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'black', 'white'];

  constructor(
    public dialogRef: MatDialogRef<ProjectDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: Project },
    private projectService: ProjectService
  ) {
    this.project = data.project;
  }

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.projectService.getUsersByIds(this.project.members).subscribe((users: User[]) => {
      this.members = users;
    }, error => {
      console.error('Error loading members:', error);
    });
  }

  updateProject() {
    this.projectService.updateProject(this.project).then(() => {
      this.dialogRef.close(this.project);
    });
  }

  addMembers(users: User[]) {
    const userIds = users.map(user => user.uid);
    const promises = userIds.map(userId => {
      if (userId) {
        return this.projectService.addMemberToProject(this.project.id, userId);
      } else {
        console.error('Undefined userId:', users);
        return Promise.reject('Undefined userId in users array');
      }
    });

    Promise.all(promises).then(() => {
      this.project.members.push(...userIds);
      this.loadMembers(); // 新しいメンバーを読み込む
    }).catch(error => {
      console.error('Error adding members:', error);
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
