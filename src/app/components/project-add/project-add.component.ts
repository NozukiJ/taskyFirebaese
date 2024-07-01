import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { UserSearchComponent } from '../user-search/user-search.component';
import { User } from '../../core/models/user.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, UserSearchComponent],
  selector: 'app-project-add',
  templateUrl: './project-add.component.html',
  styleUrls: ['./project-add.component.css']
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

  constructor(
    public dialogRef: MatDialogRef<ProjectAddComponent>,
    private projectService: ProjectService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // 認証サービスから現在のユーザー情報を非同期に取得
    this.authService.user$.subscribe(user => {
      console.log('認証ユーザー情報:', user); // デバッグ用ログ
      // 取得したユーザー情報からユーザーID (UID) を設定
      this.currentUserUid = user?.uid;
      console.log('取得したユーザーID:', this.currentUserUid); // デバッグ用ログ

      // ユーザーIDが取得できた場合の処理
      if (this.currentUserUid) {
        // 新しいプロジェクトのオーナーリストに現在のユーザーIDを追加
        this.newProject.owners.push(this.currentUserUid);
        console.log('オーナーリストに追加:', this.newProject.owners); // デバッグ用ログ

        // ユーザーサービスを使って現在のユーザー情報を取得
        this.userService.getUserById(this.currentUserUid).subscribe(user => {
          console.log('ユーザー情報取得:', user); // デバッグ用ログ
          // 取得したユーザー情報が存在する場合の処理
          if (user) {
            // オーナーリストにユーザー情報を追加
            this.owners.push({ ...user, uid: this.currentUserUid as string });
            console.log('オーナー情報に追加:', this.owners); // デバッグ用ログ
          } else {
            console.error('ユーザー情報が存在しません:', this.currentUserUid);
          }
        }, error => {
          console.error('ユーザー情報の取得に失敗しました:', error);
        });
      }
    }, error => {
      console.error('認証ユーザー情報の取得に失敗しました:', error);
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

  addMembers(users: User[]) {
    const existingMembers = users.filter(user => this.newProject.members.includes(user.uid));

    if (existingMembers.length > 0) {
      alert('選択されたユーザーは既にメンバーです。');
    } else {
      const newMembers = users.filter(user => !this.newProject.members.includes(user.uid));
      this.newProject.members.push(...newMembers.map(user => user.uid));
      newMembers.forEach(user => {
        if (!this.members.some(member => member.uid === user.uid)) {
          this.members.push(user);
        }
      });
    }
  }

  addOwners(users: User[]) {
    const existingOwners = users.filter(user => this.newProject.owners.includes(user.uid));

    if (existingOwners.length > 0) {
      alert('選択されたユーザーは既にオーナーです。');
    } else {
      const newOwners = users.filter(user => !this.newProject.owners.includes(user.uid));
      this.newProject.owners.push(...newOwners.map(user => user.uid));
      newOwners.forEach(user => {
        if (!this.owners.some(owner => owner.uid === user.uid)) {
          this.owners.push(user);
        }
      });
    }
  }

  removeMember(user: User) {
    if (user && user.uid) {
      this.newProject.members = this.newProject.members.filter(id => id !== user.uid);
      this.members = this.members.filter(member => member.uid !== user.uid);
    }
  }

  removeOwner(user: User) {
    if (user && user.uid && user.uid !== this.currentUserUid) {
      this.newProject.owners = this.newProject.owners.filter(id => id !== user.uid);
      this.owners = this.owners.filter(owner => owner.uid !== user.uid);
    } else {
      console.error('Cannot remove owner: user ID is undefined or user object is invalid', user);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
