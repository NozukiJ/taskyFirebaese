import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: AngularFirestore) {}

  getUserById(id: string): Observable<User | undefined> {
    return this.firestore.collection<User>('users').doc(id).valueChanges();
  }
}
