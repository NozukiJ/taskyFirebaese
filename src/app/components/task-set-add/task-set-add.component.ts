// src/app/components/task-set-add/task-set-add.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Task } from '../../core/models/task.model';
import { TaskSetService } from '../../core/services/taskSet.service';

@Component({
  selector: 'app-task-set-add',
  templateUrl: './task-set-add.component.html',
  styleUrls: ['./task-set-add.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TaskSetAddComponent implements OnInit {
  colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'black', 'white'];
  reminderUnits: string[] = ['分', '時間', '日', '週'];
  excludeDate: string = '';
  newTask: Task = {
    id: '',
    title: '',
    description: '',
    completed: false,
    priority: 'low',
    startDateTime: '',
    endDateTime: '',
    duration: 0,  // 追加
    tag: '',
    subtasks: [],
    selected: false,
    tagColor: 'white',
    status: '未着手',
    projectId: '',
    repeatSettings: {
      frequency: 'none',
      daysOffsetFromEnd: 1,
      endDate: '',
      businessDaysOnly: false,
      excludeDates: []
    },
    reminderTime: {
      value: 0,
      unit: '分'
    },
    userId: ''
  };

  constructor(
    public dialogRef: MatDialogRef<TaskSetAddComponent>,
    private taskSetService: TaskSetService,
    @Inject(MAT_DIALOG_DATA) public data: { taskSetId: string }
  ) {}

  ngOnInit(): void {
    const userId = this.taskSetService.getCurrentUserId();
    if (userId) {
      this.newTask.userId = userId;
    }
  }

  async saveTask() {
    try {
      await this.taskSetService.addTaskToTaskSet(this.data.taskSetId, this.newTask);
      this.dialogRef.close(this.newTask);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
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
}
