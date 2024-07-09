import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IntervalSet } from '../models/intervalSet.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class IntervalSetService {
  private userId: string | null = null;

  constructor(private firestore: AngularFirestore, private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      this.userId = user?.uid || null;
    });
  }

  private getUserIntervalSetsCollection() {
    if (!this.userId) {
      throw new Error('User ID is not available');
    }
    return this.firestore.collection(`users/${this.userId}/intervalSets`);
  }

  getIntervalSets() {
    return this.getUserIntervalSetsCollection().valueChanges({ idField: 'id' });
  }

  createIntervalSet(intervalSet: IntervalSet) {
    return this.getUserIntervalSetsCollection().add(intervalSet);
  }

  updateIntervalSet(intervalSet: IntervalSet) {
    return this.getUserIntervalSetsCollection().doc(intervalSet.id).update(intervalSet);
  }

  deleteIntervalSet(intervalSet: IntervalSet) {
    return this.getUserIntervalSetsCollection().doc(intervalSet.id).delete();
  }

  addIntervalToIntervalSet(intervalSetId: string, interval: any): Promise<void> {
    if (!this.userId) {
      return Promise.reject('User ID is not available');
    }
    const intervalId = this.firestore.createId();
    interval.id = intervalId;
    return this.firestore
      .collection(`users/${this.userId}/intervalSets/${intervalSetId}/intervals`)
      .doc(intervalId)
      .set(interval);
  }

  getIntervalsForIntervalSet(intervalSetId: string) {
    if (!this.userId) {
      throw new Error('User ID is not available');
    }
    return this.firestore.collection(`users/${this.userId}/intervalSets/${intervalSetId}/intervals`).valueChanges({ idField: 'id' });
  }

  deleteIntervalFromIntervalSet(intervalSetId: string, intervalId: string): Promise<void> {
    if (!this.userId) {
      return Promise.reject('User ID is not available');
    }
    return this.firestore.collection(`users/${this.userId}/intervalSets/${intervalSetId}/intervals`).doc(intervalId).delete();
  }

  updateIntervalInIntervalSet(intervalSetId: string, interval: any): Promise<void> {
    if (!this.userId) {
      return Promise.reject('User ID is not available');
    }
    return this.firestore.collection(`users/${this.userId}/intervalSets/${intervalSetId}/intervals`).doc(interval.id).update(interval);
  }

  waitForUserId() {
    return new Promise<void>((resolve, reject) => {
      if (this.userId) {
        resolve();
      } else {
        const subscription = this.authService.user$.subscribe(user => {
          if (user?.uid) {
            this.userId = user.uid;
            subscription.unsubscribe();
            resolve();
          }
        });
      }
    });
  }

  getCurrentUserId(): string | null {
    return this.userId;
  }
}
