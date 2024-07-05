// src\app\components\project-user-search\project-user-search.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-user-search',
  templateUrl: './project-user-search.component.html',
  styleUrls: ['./project-user-search.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProjectUserSearchComponent {
  searchTerm: string = '';
  users: User[] = [];
  @Output() userSelected = new EventEmitter<User[]>();

  constructor(private firestore: AngularFirestore) {}

  searchUsers() {
    this.users = []; 

    this.firestore.collection<User>('users', ref =>
      ref.where('email', '==', this.searchTerm)
    ).get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.users.push({ ...doc.data(), uid: doc.id });
      });
      this.userSelected.emit(this.users);
    });

    this.firestore.collection<User>('users', ref =>
      ref.where('displayName', '==', this.searchTerm)
    ).get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.users.push({ ...doc.data(), uid: doc.id });
      });
      this.userSelected.emit(this.users);
    });

    this.firestore.collection<User>('users', ref =>
      ref.where('uid', '==', this.searchTerm)
    ).get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.users.push({ ...doc.data(), uid: doc.id });
      });
      this.userSelected.emit(this.users);
    });
  }
}
