// src\app\components\project-add\project-add.component.ts
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ProjectUserSearchComponent } from '../project-user-search/project-user-search.component';
import { User } from '../../core/models/user.model';

interface UserSelectionEvent {
  user: User;
  role: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ProjectUserSearchComponent],
  selector: 'app-project-add',
  templateUrl: './project-add.component.html',
  styleUrls: ['./project-add.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProjectAddComponent implements OnInit {
  colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'black', 'white'];
  newProject: Project = {
    id: this.generateId(),
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    color: 'white',
    tasks: [],
    members: [],
    owners: []
  };
  members: User[] = [];
  owners: User[] = [];
  currentUserUid: string | undefined;
  searchedUsers: User[] = []; // 検索結果のユーザーを保持するプロパティ

  constructor(
    public dialogRef: MatDialogRef<ProjectAddComponent>,
    private projectService: ProjectService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUserUid = user?.uid;
      if (this.currentUserUid) {
        this.newProject.owners.push(this.currentUserUid);
        this.userService.getUserById(this.currentUserUid).subscribe(user => {
          if (user) {
            this.owners.push({ ...user, uid: this.currentUserUid as string }); // string型にキャスト
          }
        });
      }
    });
  }

  async saveProject() {
    try {
      await this.projectService.addProject(this.newProject);
      this.dialogRef.close(this.newProject);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  handleUserSelected(event: UserSelectionEvent) {
    const { user, role } = event;
    if (role === 'member') {
      this.addMember(user);
    } else if (role === 'owner') {
      this.addOwner(user);
    }
  }

  addMember(user: User) {
    if (!this.newProject.members.includes(user.uid)) {
      this.newProject.members.push(user.uid);
      this.members.push(user);
    } else {
      alert('選択されたユーザーは既にメンバーです。');
    }
  }

  addOwner(user: User) {
    if (!this.newProject.owners.includes(user.uid)) {
      this.newProject.owners.push(user.uid);
      this.owners.push(user);
    } else {
      alert('選択されたユーザーは既にオーナーです。');
    }
  }

  removeMember(user: User) {
    this.newProject.members = this.newProject.members.filter(id => id !== user.uid);
    this.members = this.members.filter(member => member.uid !== user.uid);
  }

  removeOwner(user: User) {
    if (user.uid !== this.currentUserUid) {
      this.newProject.owners = this.newProject.owners.filter(id => id !== user.uid);
      this.owners = this.owners.filter(owner => owner.uid !== user.uid);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
