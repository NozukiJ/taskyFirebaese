import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';
import { ProjectUserSearchComponent } from '../project-user-search/project-user-search.component';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

interface UserSelectionEvent {
  user: User;
  role: string;
}

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ProjectUserSearchComponent]
})
export class ProjectDetailComponent implements OnInit {
  project: Project;
  projectCopy: Project;
  members: User[] = [];
  membersCopy: User[] = [];
  owners: User[] = [];
  ownersCopy: User[] = [];
  colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'black', 'white'];
  isOwner: boolean = false;
  currentUserUid: string | undefined;
  searchedUsers: User[] = [];

  constructor(
    public dialogRef: MatDialogRef<ProjectDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: Project },
    private projectService: ProjectService,
    private userService: UserService,
    public authService: AuthService
  ) {
    this.project = data.project;
    this.projectCopy = JSON.parse(JSON.stringify(this.project));
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
    this.membersCopy = [];
    this.projectCopy.members.forEach(memberId => {
      this.userService.getUserById(memberId).subscribe(user => {
        if (user) {
          this.members.push({ ...user, uid: memberId });
          this.membersCopy.push({ ...user, uid: memberId });
        }
      });
    });
  }

  loadOwners() {
    this.owners = [];
    this.ownersCopy = [];
    this.projectCopy.owners.forEach(ownerId => {
      this.userService.getUserById(ownerId).subscribe(user => {
        if (user) {
          this.owners.push({ ...user, uid: ownerId });
          this.ownersCopy.push({ ...user, uid: ownerId });
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
      this.projectCopy.members = this.membersCopy.map(member => member.uid);
      this.projectCopy.owners = this.ownersCopy.map(owner => owner.uid);
      await this.projectService.updateProject(this.projectCopy);
      this.dialogRef.close(this.projectCopy);
    } catch (error: any) {
      console.error('Error saving project:', error);
      alert(`プロジェクトの保存に失敗しました: ${error.message}`);
    }
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
    if (!this.membersCopy.some(member => member.uid === user.uid)) {
      this.membersCopy.push(user);
    } else {
      alert('選択されたユーザーは既にメンバーです。');
    }
  }

  addOwner(user: User) {
    if (!this.ownersCopy.some(owner => owner.uid === user.uid)) {
      this.ownersCopy.push(user);
    } else {
      alert('選択されたユーザーは既にオーナーです。');
    }
  }

  removeMember(user: User) {
    this.membersCopy = this.membersCopy.filter(member => member.uid !== user.uid);
  }

  removeOwner(user: User) {
    if (user.uid !== this.currentUserUid) {
      this.ownersCopy = this.ownersCopy.filter(owner => owner.uid !== user.uid);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
