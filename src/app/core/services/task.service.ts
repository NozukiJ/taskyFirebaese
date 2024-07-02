import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Task } from '../models/task.model';
import { HolidayService } from './holiday.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TaskDetailComponent } from '../../components/task-detail/task-detail.component';
import { Observable, of } from 'rxjs';
import { endOfMonth, subDays } from 'date-fns';
import { AuthService } from './auth.service';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private currentDialogRefs: { [taskId: string]: MatDialogRef<TaskDetailComponent> } = {};

  constructor(
    private firestore: AngularFirestore,
    private holidayService: HolidayService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  getCurrentUserId(): string | null {
    return this.authService.getCurrentUserId();
  }

  getUserTasks(): Observable<Task[]> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore
            .collection<Task>(`users/${user.uid}/tasks`)
            .snapshotChanges()
            .pipe(
              map(actions => {
                return actions.map(a => {
                  const data = a.payload.doc.data() as Task;
                  const id = a.payload.doc.id;
                  return {
                    id: id,
                    title: data.title,
                    completed: data.completed,
                    description: data.description,
                    priority: data.priority,
                    startDateTime: data.startDateTime,
                    endDateTime: data.endDateTime,
                    tag: data.tag,
                    selected: data.selected,
                    tagColor: data.tagColor,
                    status: data.status,
                    subtasks: data.subtasks,
                    reminderTime: data.reminderTime,
                    projectId: data.projectId,
                    repeatSettings: data.repeatSettings,
                    userId: data.userId
                  };
                });
              })
            );
        } else {
          return of([]);
        }
      })
    );
  }

  getTasksByUserId(userId: string): Observable<Task[]> {
    return this.firestore.collection<Task>(`users/${userId}/tasks`).valueChanges();
  }

  // 新しいメソッドを追加
  getTasks(): Observable<Task[]> {
    const userId = this.getCurrentUserId();
    if (userId) {
      return this.firestore.collection<Task>(`users/${userId}/tasks`).valueChanges();
    } else {
      return of([]);
    }
  }

  addTask(task: Omit<Task, 'id'>): Promise<void> {
    const userId = this.getCurrentUserId();
    if (userId) {
      const id = this.firestore.createId();
      const taskWithId: Task = {
        ...task,
        id: id,
        userId: userId
      };
      return this.firestore.collection(`users/${userId}/tasks`).doc(id).set(taskWithId);
    } else {
      return Promise.reject('User not authenticated');
    }
  }

  updateTask(task: Task): Promise<void> {
    const userId = this.getCurrentUserId();
    if (userId) {
      const updatedTask = { ...task, userId: userId };
      return this.firestore.collection(`users/${userId}/tasks`).doc(task.id).set(updatedTask);
    } else {
      return Promise.reject('User not authenticated');
    }
  }

  duplicateTask(task: Task): Promise<void> {
    const userId = this.getCurrentUserId();
    if (userId) {
      const newTaskId = this.generateId();
      const newTask = { ...task, id: newTaskId, userId: userId };
      return this.firestore.collection(`users/${userId}/tasks`).doc(newTaskId).set(newTask);
    } else {
      return Promise.reject('User not authenticated');
    }
  }

  deleteTask(task: Task): Promise<void> {
    const userId = this.getCurrentUserId();
    if (userId) {
      return this.firestore.collection(`users/${userId}/tasks`).doc(task.id).delete();
    } else {
      return Promise.reject('User not authenticated');
    }
  }

  openTaskDetail(task: Task) {
    console.log('openTaskDetail called');

    if (this.currentDialogRefs[task.id]) {
      console.log('Task detail is already open for this task:', task.id);
      return; // 既にタスク詳細が開かれている場合は何もしない
    }

    const dialogRef = this.dialog.open(TaskDetailComponent, {
      data: { task }
    });

    this.currentDialogRefs[task.id] = dialogRef;

    dialogRef.afterClosed().subscribe(() => {
      console.log('Dialog closed for task:', task.id);
      delete this.currentDialogRefs[task.id]; // ダイアログが閉じられたら参照を削除
    });
  }

  async generateRecurringTasks() {
    const today = new Date().toISOString().split('T')[0];
    try {
      const holidays = await this.holidayService.getHolidays();
      const tasksSnapshot = await this.firestore.collection<Task>('tasks').get().toPromise();

      if (tasksSnapshot) {
        tasksSnapshot.forEach(taskDoc => {
          const task = taskDoc.data() as Task;
          if (task.repeatSettings) {
            switch (task.repeatSettings.frequency) {
              case 'monthlyFromEnd':
                this.generateMonthlyFromEndTasks(task, today, holidays);
                break;
            }
          }
        });
      }

    } catch (error) {
      console.error("Failed to generate recurring tasks:", error);
    }
  }

  private generateMonthlyFromEndTasks(task: Task, today: string, holidays: string[]) {
    let currentDate = new Date(task.startDateTime);
    const endDate = task.repeatSettings!.endDate ? new Date(task.repeatSettings!.endDate) : null;

    while (currentDate.toISOString().split('T')[0] <= today && (!endDate || currentDate <= endDate)) {
      const monthEnd = endOfMonth(currentDate);
      let repeatDate = subDays(monthEnd, task.repeatSettings!.daysOffsetFromEnd!);

      if (task.repeatSettings!.businessDaysOnly) {
        repeatDate = this.adjustForHolidaysAndWeekends(repeatDate, holidays);
      }

      if (repeatDate.toISOString().split('T')[0] <= today) {
        this.createTaskInstance(task, repeatDate.toISOString());
      }

      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  private adjustForHolidaysAndWeekends(date: Date, holidays: string[]): Date {
    while (holidays.includes(date.toISOString().split('T')[0]) || date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() - 1);
    }
    return date;
  }

  private createTaskInstance(task: Task, date: string) {
    const newTaskId = this.generateId();
    const newTask = { ...task, id: newTaskId, startDateTime: date };
    this.firestore.collection(`users/${task.userId}/tasks`).doc(newTaskId).set(newTask);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
