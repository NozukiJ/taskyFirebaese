// src\app\components\project-detail\project-detail.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';
import { UserSearchComponent } from '../user-search/user-search.component';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, UserSearchComponent]
})
export class ProjectDetailComponent implements OnInit {
  project: Project;
  projectCopy: Project;
  members: User[] = [];
  owners: User[] = [];
  colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'black', 'white'];
  isOwner: boolean = false;
  currentUserUid: string | undefined;

  constructor(
    public dialogRef: MatDialogRef<ProjectDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: Project },
    private projectService: ProjectService,
    private userService: UserService,
    public authService: AuthService
  ) {
    this.project = data.project;
    this.projectCopy = JSON.parse(JSON.stringify(this.project)); // プロジェクトのコピーを作成
  }

  ngOnInit() {
    this.loadMembers();
    this.loadOwners();
    this.checkIfOwner();
    this.authService.user$.subscribe(user => {
      this.currentUserUid = user?.uid;
    });
  }

  loadMembers() {
    this.members = [];
    this.projectCopy.members.forEach(memberId => {
      this.userService.getUserById(memberId).subscribe(user => {
        if (user) {
          this.members.push({ ...user, uid: memberId });
          console.log('Member loaded:', user);
        }
      });
    });
  }

  loadOwners() {
    this.owners = [];
    this.projectCopy.owners.forEach(ownerId => {
      this.userService.getUserById(ownerId).subscribe(user => {
        if (user) {
          this.owners.push({ ...user, uid: ownerId });
          console.log('Owner loaded:', user);
        }
      });
    });
  }

  checkIfOwner() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.isOwner = this.projectCopy.owners.includes(user.uid);
      }
    });
  }

  async updateProject() {
    try {
      await this.projectService.updateProject(this.projectCopy);
      this.dialogRef.close(this.projectCopy);
    } catch (error: any) {
      console.error('Error saving project:', error);
      alert(`プロジェクトの保存に失敗しました: ${error.message}`);
    }
  }
  


  addMembers(users: User[]) {
    const existingMembers = users.filter(user => this.projectCopy.members.includes(user.uid));

    if (existingMembers.length > 0) {
      alert('選択されたユーザーは既にメンバーです。');
    } else {
      const newMembers = users.filter(user => !this.projectCopy.members.includes(user.uid));
      this.projectCopy.members.push(...newMembers.map(user => user.uid));
      this.loadMembers();
    }
  }

  addOwners(users: User[]) {
    const existingOwners = users.filter(user => this.projectCopy.owners.includes(user.uid));

    if (existingOwners.length > 0) {
      alert('選択されたユーザーは既にオーナーです。');
    } else {
      const newOwners = users.filter(user => !this.projectCopy.owners.includes(user.uid));
      this.projectCopy.owners.push(...newOwners.map(user => user.uid));
      this.loadOwners();
    }
  }

  removeMember(user: User) {
    if (user && user.uid) {
      console.log('Removing member with ID:', user.uid);
      this.projectCopy.members = this.projectCopy.members.filter(id => id !== user.uid);
      this.members = this.members.filter(member => member.uid !== user.uid);
      console.log('Member removed:', user);
    } else {
      console.error('Cannot remove member: user ID is undefined or user object is invalid', user);
    }
  }

  removeOwner(user: User) {
    if (user && user.uid && user.uid !== this.currentUserUid) {
      console.log('Removing owner with ID:', user.uid);
      this.projectCopy.owners = this.projectCopy.owners.filter(id => id !== user.uid);
      this.owners = this.owners.filter(owner => owner.uid !== user.uid);
      console.log('Owner removed:', user);
    } else {
      console.error('Cannot remove owner: user ID is undefined or user object is invalid', user);
    }
  }

  cancel() {
    this.dialogRef.close(); // ダイアログを閉じるだけ
  }
}
