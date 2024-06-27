//src\app\core\services\reminder.service.ts
import { Injectable } from '@angular/core';
import { Task, Subtask } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private reminders: { [taskId: string]: number } = {};
  private subtaskReminders: { [subtaskId: string]: number } = {};

  constructor() {}

  setReminder(task: Task, timeBeforeStart: number) {
    const startDate = new Date(task.startDateTime).getTime();
    const reminderTime = startDate - timeBeforeStart;
    const now = Date.now();

    if (reminderTime > now) {
      const timeoutId = window.setTimeout(() => {
        const timeRemaining = this.calculateTimeRemaining(startDate - Date.now());
        alert(`タスク "${task.title}" の開始時間が近づいています！残り時間: ${timeRemaining}`);
        delete this.reminders[task.id];
      }, reminderTime - now);

      this.reminders[task.id] = timeoutId;
    }
  }

  clearReminder(task: Task) {
    if (this.reminders[task.id]) {
      clearTimeout(this.reminders[task.id]);
      delete this.reminders[task.id];
    }
  }

  setSubtaskReminder(subtask: Subtask, timeBeforeStart: number, taskStartDate: string) {
    const startDate = new Date(taskStartDate).getTime();
    const reminderTime = startDate - timeBeforeStart;
    const now = Date.now();

    if (reminderTime > now) {
      const timeoutId = window.setTimeout(() => {
        const timeRemaining = this.calculateTimeRemaining(startDate - Date.now());
        alert(`サブタスク "${subtask.title}" の開始時間が近づいています！残り時間: ${timeRemaining}`);
        delete this.subtaskReminders[subtask.id];
      }, reminderTime - now);

      this.subtaskReminders[subtask.id] = timeoutId;
    }
  }

  clearSubtaskReminder(subtask: Subtask) {
    if (this.subtaskReminders[subtask.id]) {
      clearTimeout(this.subtaskReminders[subtask.id]);
      delete this.subtaskReminders[subtask.id];
    }
  }

  private calculateTimeRemaining(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}日`;
    } else if (hours > 0) {
      return `${hours}時間`;
    } else if (minutes > 0) {
      return `${minutes}分`;
    } else {
      return `${seconds}秒`;
    }
  }
}
