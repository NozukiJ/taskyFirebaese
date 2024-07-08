import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskSetService } from '../../core/services/taskSet.service'; // 正しいパスを使用
import { TaskService } from '../../core/services/task.service';
import { ReminderService } from '../../core/services/reminder.service';
import { Task, Subtask } from '../../core/models/task.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-task-set-task-detail',
  templateUrl: './task-set-task-detail.component.html',
  styleUrls: ['./task-set-task-detail.component.css']
})
export class TaskSetTaskDetailComponent implements OnInit {
  editedTask!: Task;
  originalTask!: Task;
  colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'black', 'white'];
  reminderUnits: string[] = ['分', '時間', '日', '週'];
  excludeDate: string = '';

  constructor(
    private taskService: TaskService,
    private reminderService: ReminderService,
    private taskSetService: TaskSetService,
    public dialogRef: MatDialogRef<TaskSetTaskDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.task) {
      this.originalTask = { ...data.task };
      this.editedTask = { ...data.task, subtasks: [...data.task.subtasks] };
    } else {
      this.editedTask = {
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
          frequency: 'none',
          businessDaysOnly: false,
          excludeDates: []
        },
        reminderTime: {
          value: null,
          unit: '分'
        },
        userId: ''
      };
      this.originalTask = { ...this.editedTask };
    }
  }

  ngOnInit(): void {
    if (!this.editedTask.reminderTime) {
      this.editedTask.reminderTime = {
        value: null,
        unit: '分'
      };
    }

    if (!this.editedTask.subtasks) {
      this.editedTask.subtasks = [];
    }
  }

  async saveTask() {
    if (this.editedTask.reminderTime && this.editedTask.reminderTime.value !== null) {
      const timeBeforeStart = this.calculateReminderTime({
        value: this.editedTask.reminderTime.value,
        unit: this.editedTask.reminderTime.unit
      });
      this.reminderService.setReminder(this.editedTask, timeBeforeStart);
    }

    try {
      if (this.editedTask.id) {
        await this.taskSetService.updateTaskInTaskSet(this.data.taskSetId, this.editedTask); 
      } else {
        await this.taskSetService.addTaskToTaskSet(this.data.taskSetId, this.editedTask); 
      }
      this.dialogRef.close(this.editedTask);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async duplicateTask() {
    await this.taskSetService.duplicateTask(this.data.taskSetId, this.editedTask); 
    this.dialogRef.close();
  }

  addSubtask() {
    if (!this.editedTask.subtasks) {
      this.editedTask.subtasks = [];
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
    this.editedTask.subtasks.push(newSubtask);
  }

  deleteSubtask(index: number) {
    if (this.editedTask.subtasks) {
      this.editedTask.subtasks.splice(index, 1);
    }
  }

  cancel() {
    this.dialogRef.close(this.originalTask); 
  }

  selectColor(color: string) {
    this.editedTask.tagColor = color;
  }

  addExcludeDate() {
    if (!this.editedTask.repeatSettings) {
      this.editedTask.repeatSettings = { frequency: 'none', businessDaysOnly: false, excludeDates: [] };
    }
    if (!this.editedTask.repeatSettings.excludeDates) {
      this.editedTask.repeatSettings.excludeDates = [];
    }
    if (this.excludeDate) {
      this.editedTask.repeatSettings.excludeDates.push(this.excludeDate);
      this.excludeDate = '';
    }
  }

  removeExcludeDate(date: string) {
    if (this.editedTask.repeatSettings && this.editedTask.repeatSettings.excludeDates) {
      this.editedTask.repeatSettings.excludeDates = this.editedTask.repeatSettings.excludeDates.filter(d => d !== date);
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
