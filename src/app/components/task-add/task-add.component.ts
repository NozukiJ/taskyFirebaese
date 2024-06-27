import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, RepeatSettings } from '../../core/models/task.model';
import { ReminderService } from '../../core/services/reminder.service';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/project.model';
import { TaskService } from '../../core/services/task.service';
import { Inject } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-task-add',
  templateUrl: './task-add.component.html',
  styleUrls: ['./task-add.component.css']
})
export class TaskAddComponent {
  colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'black', 'white'];
  reminderUnits: string[] = ['分', '時間', '日', '週'];
  projects: Project[] = [];
  excludeDate: string = '';

  newTask: Task = {
    id: this.generateId(),
    title: '',
    description: '',
    completed: false,
    priority: 'low',
    startDateTime: '',
    endDateTime: '',
    tag: '',
    subtasks: [],
    selected: false,
    tagColor: 'white',
    status: '未着手',
    projectId: '',
    repeatSettings: {
      frequency: 'none', // デフォルトを 'none' に設定
      daysOffsetFromEnd: 1,
      endDate: '',
      businessDaysOnly: false,
      excludeDates: []
    },
    reminderTime: {
      value: 0,
      unit: '分'
    }
  };
  

  constructor(
    public dialogRef: MatDialogRef<TaskAddComponent>,
    private reminderService: ReminderService,
    private projectService: ProjectService,
    @Inject(TaskService) private taskService: TaskService
  ) {
    this.projects = this.projectService.getProjects();
  }

  saveTask() {
    if (this.newTask.startDateTime && this.newTask.reminderTime && this.newTask.reminderTime.value !== null) {
      const timeBeforeStart = this.calculateReminderTime({
        value: this.newTask.reminderTime.value,
        unit: this.newTask.reminderTime.unit
      });
      this.reminderService.setReminder(this.newTask, timeBeforeStart);
    }
    this.taskService.addTask(this.newTask);
    this.dialogRef.close(this.newTask);
  }

  cancel() {
    this.dialogRef.close();
  }

  selectColor(color: string) {
    this.newTask.tagColor = color;
  }

  addExcludeDate() {
    if (this.excludeDate) {
      this.newTask.repeatSettings?.excludeDates?.push(this.excludeDate);
      this.excludeDate = '';
    }
  }

  removeExcludeDate(date: string) {
    if (this.newTask.repeatSettings?.excludeDates) {
      this.newTask.repeatSettings.excludeDates = this.newTask.repeatSettings.excludeDates.filter(d => d !== date);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private calculateReminderTime(reminder: { value: number, unit: string }): number {
    const { value, unit } = reminder;
    switch (unit) {
      case '分':
        return value * 60 * 1000;
      case '時間':
        return value * 60 * 60 * 1000;
      case '日':
        return value * 24 * 60 * 60 * 1000;
      case '週':
        return value * 7 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }
}
