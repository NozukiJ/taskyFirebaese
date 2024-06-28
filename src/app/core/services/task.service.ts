import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Task } from '../models/task.model';
import { HolidayService } from './holiday.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TaskDetailComponent } from '../../components/task-detail/task-detail.component';
import { Observable } from 'rxjs';
import { endOfMonth, subDays } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private currentDialogRefs: { [taskId: string]: MatDialogRef<TaskDetailComponent> } = {};

  constructor(
    private firestore: AngularFirestore,
    private holidayService: HolidayService,
    private dialog: MatDialog
  ) {}

  getTasks(): Observable<Task[]> {
    return this.firestore.collection<Task>('tasks').valueChanges();
  }

  addTask(task: Task): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection('tasks').doc(id).set({ ...task, id });
  }

  updateTask(task: Task): Promise<void> {
    return this.firestore.collection('tasks').doc(task.id).set(task);
  }

  duplicateTask(task: Task): Promise<void> {
    const newTask: Task = { ...task, id: this.generateId() };
    return this.firestore.collection('tasks').doc(newTask.id).set(newTask);
  }

  deleteTask(task: Task): Promise<void> {
    return this.firestore.collection('tasks').doc(task.id).delete();
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
    const newTask: Task = { ...task, startDateTime: date, id: this.generateId() };
    this.firestore.collection('tasks').doc(newTask.id).set(newTask);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}