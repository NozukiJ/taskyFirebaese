// src\app\core\services\auth.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<firebase.User | null>;

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {
    this.user$ = this.afAuth.authState;
  }

  async login(email: string, password: string): Promise<void> {
    await this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async register(email: string, password: string): Promise<void> {
    await this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  async resetPassword(email: string): Promise<void> {
    await this.afAuth.sendPasswordResetEmail(email);
  }

  async logout(): Promise<void> {
    await this.afAuth.signOut();
  }

  async updateProfile(displayName: string, bio: string, company: string, position: string, team: string): Promise<void> {
    const user = firebase.auth().currentUser;
    if (user) {
      await user.updateProfile({ displayName });
      return this.firestore.collection('users').doc(user.uid).set({
        displayName,
        bio: bio || '',
        company: company || '',
        position: position || '',
        team: team || ''
      }, { merge: true });
    } else {
      return Promise.reject('ユーザーが認証されていません');
    }
  }

  getUserById(uid: string): Observable<any> {
    return this.firestore.collection('users').doc(uid).valueChanges();
  }

  getCurrentUser(): firebase.User | null {
    return firebase.auth().currentUser;
  }

  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user.uid : null;
  }
}
