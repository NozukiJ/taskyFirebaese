import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { Subtask, Task } from '../../core/models/task.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-subtask-detail',
  templateUrl: './subtask-detail.component.html',
  styleUrls: ['./subtask-detail.component.css']
})
export class SubtaskDetailComponent implements OnInit {
  @Input() subtask!: Subtask;
  colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'black', 'white'];
  task: Task;

  constructor(
    private taskService: TaskService,
    public dialogRef: MatDialogRef<SubtaskDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('SubtaskDetailComponent constructor called');
    console.log('Data received:', data);
    
    if (data && data.subtask && data.task) {
      this.subtask = data.subtask;
      this.task = data.task;
      console.log('Task and Subtask initialized from data:', this.task, this.subtask);
    } else {
      // サブタスクの初期化
      this.subtask = {
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
      console.log('Subtask initialized to default:', this.subtask);

      // タスクの初期化
      this.task = {
        id: this.generateId(), // IDを生成
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
      console.log('Task initialized to default:', this.task);
    }
  }

  ngOnInit(): void {
    console.log('SubtaskDetailComponent ngOnInit called');
    if (!this.task.subtasks) {
      this.task.subtasks = [];
      console.log('Subtasks initialized to empty array');
    }
  }

  async saveSubtask() {
    console.log('saveSubtask called');
    console.log('Current task state:', this.task);

    if (!this.task || !this.task.id) {
      console.error('Task is not properly initialized.');
      return;
    }

    if (!this.task.subtasks) {
      this.task.subtasks = [];
      console.log('Subtasks initialized in saveSubtask method');
    }

    const index = this.task.subtasks.findIndex(st => st.id === this.subtask.id);
    if (index !== -1) {
      this.task.subtasks[index] = this.subtask;
      console.log('Subtask updated:', this.subtask);
    } else {
      this.task.subtasks.push(this.subtask);
      console.log('Subtask added:', this.subtask);
    }

    await this.taskService.updateTask(this.task); // Firestoreに保存
    console.log('Task updated in Firestore:', this.task);
    this.dialogRef.close(this.subtask); // ダイアログを閉じる
    console.log('Dialog closed with subtask:', this.subtask);
  }

  cancel() {
    console.log('cancel called');
    this.dialogRef.close();
    console.log('Dialog closed without saving');
  }

  selectColor(color: string) {
    this.subtask.tagColor = color;
    console.log('Color selected:', color);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
