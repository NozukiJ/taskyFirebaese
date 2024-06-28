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
  task!: Task;

  constructor(
    private taskService: TaskService,
    public dialogRef: MatDialogRef<SubtaskDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.subtask && data.task) {
      this.subtask = data.subtask;
      this.task = data.task;
    }
  }

  ngOnInit(): void {
    if (!this.subtask) {
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
    }
  }

  async saveSubtask() {
    if (!this.task.subtasks) {
      this.task.subtasks = [];
    }

    const index = this.task.subtasks.findIndex(st => st.id === this.subtask.id);
    if (index !== -1) {
      this.task.subtasks[index] = this.subtask;
    } else {
      this.task.subtasks.push(this.subtask);
    }

    await this.taskService.updateTask(this.task); // Firestoreに保存
    this.dialogRef.close(this.subtask); // ダイアログを閉じる
  }

  cancel() {
    this.dialogRef.close();
  }

  selectColor(color: string) {
    this.subtask.tagColor = color;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
