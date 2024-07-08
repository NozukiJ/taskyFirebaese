import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { TaskSet } from '../models/taskSet.model';
import { Task } from '../models/task.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskSetService {
  private userId: string | null = null;

  constructor(private firestore: AngularFirestore, private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      this.userId = user?.uid || null;
    });
  }

  private getUserTaskSetsCollection() {
    if (!this.userId) {
      throw new Error('User ID is not available');
    }
    return this.firestore.collection(`users/${this.userId}/taskSets`);
  }

  getTaskSets() {
    return this.getUserTaskSetsCollection().valueChanges({ idField: 'id' });
  }

  createTaskSet(taskSet: TaskSet) {
    return this.getUserTaskSetsCollection().add(taskSet);
  }

  updateTaskSet(taskSet: TaskSet) {
    return this.getUserTaskSetsCollection().doc(taskSet.id).update(taskSet);
  }

  deleteTaskSet(taskSet: TaskSet) {
    return this.getUserTaskSetsCollection().doc(taskSet.id).delete();
  }

  addTaskToTaskSet(taskSetId: string, task: Task): Promise<void> {
    if (!this.userId) {
      return Promise.reject('User ID is not available');
    }
    const taskId = this.firestore.createId();
    task.id = taskId;
    return this.firestore
      .collection(`users/${this.userId}/taskSets/${taskSetId}/tasks`)
      .doc(taskId)
      .set(task);
  }

  getTasksForTaskSet(taskSetId: string) {
    if (!this.userId) {
      throw new Error('User ID is not available');
    }
    return this.firestore.collection(`users/${this.userId}/taskSets/${taskSetId}/tasks`).valueChanges({ idField: 'id' });
  }

  updateTaskInTaskSet(taskSetId: string, task: Task): Promise<void> {
    if (!this.userId) {
      return Promise.reject('User ID is not available');
    }
    return this.firestore
      .collection(`users/${this.userId}/taskSets/${taskSetId}/tasks`)
      .doc(task.id)
      .update(task);
  }

  duplicateTask(taskSetId: string, task: Task): Promise<void> {
    if (!this.userId) {
      return Promise.reject('User ID is not available');
    }
    const newTask = { ...task, id: this.firestore.createId() };
    return this.firestore
      .collection(`users/${this.userId}/taskSets/${taskSetId}/tasks`)
      .doc(newTask.id)
      .set(newTask);
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
