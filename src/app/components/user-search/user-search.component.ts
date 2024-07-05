import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../../core/models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { TaskListComponent } from '../task-list/task-list.component';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, TaskListComponent]
})
export class UserSearchComponent {
  searchTerm: string = '';
  users: User[] = [];
  selectedUserId: string | null = null;
  notificationMessage: string | null = null;
  @Output() userSelected = new EventEmitter<User[]>();

  constructor(private firestore: AngularFirestore, private taskService: TaskService) {}

  searchUsers() {
    // 検索前にユーザーリストと選択されたユーザーIDをリセット
    this.users = [];
    this.selectedUserId = null;

    this.firestore.collection<User>('users', ref =>
      ref.where('email', '==', this.searchTerm)
    ).get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.users.push({ ...doc.data(), uid: doc.id });
      });
    });

    this.firestore.collection<User>('users', ref =>
      ref.where('displayName', '==', this.searchTerm)
    ).get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.users.push({ ...doc.data(), uid: doc.id });
      });
    });

    this.firestore.collection<User>('users', ref =>
      ref.where('uid', '==', this.searchTerm)
    ).get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.users.push({ ...doc.data(), uid: doc.id });
      });
    });
  }

  selectUser(userId: string) {
    this.selectedUserId = userId;
  }

  showNotificationMessage(message: string) {
    this.notificationMessage = message;
    setTimeout(() => {
      this.notificationMessage = null;
    }, 3000);
  }
}
