import { Component, Output, EventEmitter } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../../core/models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class UserSearchComponent {
  searchTerm: string = '';
  users: User[] = [];
  @Output() userSelected = new EventEmitter<User[]>();

  constructor(private firestore: AngularFirestore) {}

  searchUsers() {
    this.users = []; // 検索するたびにユーザーリストをクリアする

    this.firestore.collection<User>('users', ref =>
      ref.where('email', '==', this.searchTerm)
    ).get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.users.push({ ...doc.data(), uid: doc.id, selected: false });
      });
    });

    this.firestore.collection<User>('users', ref =>
      ref.where('displayName', '==', this.searchTerm)
    ).get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.users.push({ ...doc.data(), uid: doc.id, selected: false });
      });
    });

    this.firestore.collection<User>('users', ref =>
      ref.where('uid', '==', this.searchTerm)
    ).get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.users.push({ ...doc.data(), uid: doc.id, selected: false });
      });
    });
  }

  selectUsers() {
    const selectedUsers = this.users.filter(user => user.selected);
    console.log('Selected users:', selectedUsers); // デバッグ用ログ
    this.userSelected.emit(selectedUsers);
  }
}
