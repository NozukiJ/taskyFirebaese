//src\app\shared\components\subtask-detail\subtask-detail.component.ts
import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { Subtask } from '../../core/models/task.model';

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

  constructor(
    private taskService: TaskService,
    public dialogRef: MatDialogRef<SubtaskDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data && data.subtask) {
      this.subtask = data.subtask;
    }
  }

  ngOnInit(): void {
    if (!this.subtask) {
      this.subtask = {
        id: '',
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

  saveSubtask() {
    this.taskService.saveTasks();
    this.dialogRef.close(); // ダイアログを閉じる
  }

  cancel() {
    this.dialogRef.close();
  }

  selectColor(color: string) {
    this.subtask.tagColor = color;
  }
}
