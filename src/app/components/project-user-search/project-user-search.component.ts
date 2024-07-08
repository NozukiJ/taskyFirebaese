import { Component, Output, EventEmitter } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserSelectionEvent {
  user: User;
  role: string;
}

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
  @Output() userSelected = new EventEmitter<UserSelectionEvent>();

  constructor(private firestore: AngularFirestore) {}

  searchUsers() {
    this.users = [];
    this.firestore.collection<User>('users', ref =>
      ref.where('displayName', '==', this.searchTerm).limit(10)
    ).get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.users.push({ ...doc.data(), uid: doc.id });
      });
    });

    this.firestore.collection<User>('users', ref =>
      ref.where('email', '==', this.searchTerm).limit(10)
    ).get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.users.push({ ...doc.data(), uid: doc.id });
      });
    });

    this.firestore.collection<User>('users', ref =>
      ref.where('uid', '==', this.searchTerm).limit(10)
    ).get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.users.push({ ...doc.data(), uid: doc.id });
      });
    });
  }

  addMember(user: User) {
    this.userSelected.emit({ user, role: 'member' });
  }

  addOwner(user: User) {
    this.userSelected.emit({ user, role: 'owner' });
  }
}
