import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { ReminderService } from '../../core/services/reminder.service';
import { ProjectService } from '../../core/services/project.service';
import { Task, Subtask, RepeatSettings } from '../../core/models/task.model';
import { Project } from '../../core/models/project.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {
  @Input() task!: Task;
  colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'black', 'white'];
  reminderUnits: string[] = ['分', '時間', '日', '週'];
  projects: Project[] = [];
  excludeDate: string = '';

  constructor(
    private taskService: TaskService,
    private reminderService: ReminderService,
    @Inject(ProjectService) private projectService: ProjectService,
    public dialogRef: MatDialogRef<TaskDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.task) {
      this.task = data.task;
    }
  }

  ngOnInit(): void {
    this.projects = this.projectService.getProjects();
    if (!this.task) {
      this.task = {
        id: '',
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
          businessDaysOnly: false,
          excludeDates: []
        },
        reminderTime: {
          value: null,
          unit: '分'
        }
      };
    } else {
      if (!this.task.reminderTime) {
        this.task.reminderTime = {
          value: null,
          unit: '分'
        };
      }
    }
  }
  

  saveTask() {
    if (this.task.reminderTime && this.task.reminderTime.value !== null) {
      const timeBeforeStart = this.calculateReminderTime({
        value: this.task.reminderTime.value,
        unit: this.task.reminderTime.unit
      });
      this.reminderService.setReminder(this.task, timeBeforeStart);
    }
    this.taskService.saveTasks();
    this.dialogRef.close();
  }

  duplicateTask() {
    this.taskService.duplicateTask(this.task);
    this.dialogRef.close();
  }

  addSubtask() {
    if (!this.task.subtasks) {
      this.task.subtasks = [];
    }
    const newSubtask: Subtask = {
      id: this.generateId(),
      title: '新しいサブタスク',
      completed: false,
      description: '',
      priority: 'low',
      startDateTime: '',
      endDateTime: '',
      tag: '',
      selected: false,
      tagColor: 'white',
      status: '未着手'
    };
    this.task.subtasks.push(newSubtask);
    this.saveTask();
  }

  deleteSubtask(index: number) {
    if (this.task.subtasks) {
      this.task.subtasks.splice(index, 1);
      this.saveTask();
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  selectColor(color: string) {
    this.task.tagColor = color;
  }

  addExcludeDate() {
    if (this.excludeDate) {
      this.task.repeatSettings?.excludeDates?.push(this.excludeDate);
      this.excludeDate = '';
    }
  }

  removeExcludeDate(date: string) {
    if (this.task.repeatSettings?.excludeDates) {
      this.task.repeatSettings.excludeDates = this.task.repeatSettings.excludeDates.filter(d => d !== date);
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
