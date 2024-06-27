import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Task } from '../models/task.model';
import { HolidayService } from './holiday.service';
import { startOfMonth, endOfMonth, subDays } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private holidayService: HolidayService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        try {
          this.tasks = JSON.parse(savedTasks);
        } catch (error) {
          console.error("Invalid JSON data in localStorage:", error);
          this.tasks = [];
        }
      } else {
        this.tasks = this.getSampleTasks(); // サンプルデータを追加
      }
    }
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  addTask(task: Task) {
    this.tasks.push(task);
    this.saveTasks();
  }

  duplicateTask(task: Task) {
    const newTask: Task = { ...task, id: this.generateId() };
    this.tasks.push(newTask);
    this.saveTasks();
  }

  saveTasks() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
  }

  deleteTask(task: Task) {
    this.tasks = this.tasks.filter(t => t.id !== task.id);
    this.saveTasks();
  }

  async generateRecurringTasks() {
    const today = new Date().toISOString().split('T')[0];
    try {
      const holidays = await this.holidayService.getHolidays();

      this.tasks.forEach(task => {
        if (task.repeatSettings) {
          switch (task.repeatSettings.frequency) {
            case 'monthlyFromEnd':
              this.generateMonthlyFromEndTasks(task, today, holidays);
              break;
            // 他のケースをここに追加できます
          }
        }
      });

      this.saveTasks();
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
    this.tasks.push(newTask);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getSampleTasks(): Task[] {
    return [
      {
        id: '1',
        title: 'サンプルタスク1',
        completed: false,
        description: '説明1',
        priority: '高',
        startDateTime: '2024-06-20',
        endDateTime: '2024-06-21',
        tag: '仕事',
        selected: false,
        tagColor: 'red',
        status: '完了',
        subtasks: [],
        projectId: '007o8rqdo'
      },
      {
        id: '2',
        title: 'サンプルタスク2',
        completed: false,
        description: '説明2',
        priority: '中',
        startDateTime: '2024-06-20',
        endDateTime: '2024-06-21',
        tag: 'プライベート',
        selected: false,
        tagColor: 'blue',
        status: '進行中',
        subtasks: [],
        projectId: 'cvfw7dj3b'
      },
      {
        id: '3',
        title: 'サンプルタスク3',
        completed: false,
        description: '説明3',
        priority: '低',
        startDateTime: '2024-06-20',
        endDateTime: '2024-06-21',
        tag: '学習',
        selected: false,
        tagColor: 'green',
        status: '未開始',
        subtasks: [],
        projectId: 'n9tncsrc2'
      }
    ];
  }
}
