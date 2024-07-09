import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { ReminderService } from '../../core/services/reminder.service';
import { ProjectService } from '../../core/services/project.service';
import { Task, Subtask } from '../../core/models/task.model';
import { Project } from '../../core/models/project.model';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {
  @Input() task!: Task;
  @Input() isReadOnly: boolean = false; // 追加: 読み取り専用フラグ
  editedTask!: Task; // 編集用の一時的なタスク変数
  originalTask!: Task; // 元のタスクデータを保持するためのプロパティ
  originalExcludeDates: string[] = []; // 元の除外日リストを保持
  colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'black', 'white'];
  reminderUnits: string[] = ['分', '時間', '日', '週'];
  projects$: Observable<Project[]> | null = null;
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
      this.isReadOnly = data.isReadOnly; // 読み取り専用フラグを設定
      this.originalTask = { ...data.task }; // 元のデータを保持
      this.originalExcludeDates = data.task.repeatSettings?.excludeDates ? [...data.task.repeatSettings.excludeDates] : []; // 元の除外日リストを保持
      this.editedTask = { ...data.task, subtasks: [...data.task.subtasks], duration: data.task.duration ?? 0 }; // 編集用にディープコピー
    } else {
      // タスクが提供されなかった場合に初期化
      this.task = {
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
        userId: '',
        duration: 0 // durationを追加
      };
      
      this.originalTask = { ...this.task }; // 元のデータを保持
      this.editedTask = { ...this.task, subtasks: [...this.task.subtasks] }; // 編集用にディープコピー
    }
  }

  ngOnInit(): void {
    this.projects$ = this.projectService.getProjectsByOwnerOrMember();
    this.projects$.subscribe(projects => {
      this.projects = projects;
    });

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
    if (this.isReadOnly) return; // 読み取り専用の場合は保存をブロック
    
    if (this.editedTask.reminderTime && this.editedTask.reminderTime.value !== null) {
      const timeBeforeStart = this.calculateReminderTime({
        value: this.editedTask.reminderTime.value,
        unit: this.editedTask.reminderTime.unit
      });
      this.reminderService.setReminder(this.editedTask, timeBeforeStart);
    }
  
    try {
      if (this.editedTask.id) {
        await this.taskService.updateTask(this.editedTask); // 既存のタスクを更新
      } else {
        await this.taskService.addTask(this.editedTask); // 新しいタスクを追加
      }
      this.dialogRef.close(this.editedTask);  // ダイアログを閉じてタスクを返す
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async duplicateTask() {
    const newTask: Task = {
      ...this.editedTask,
      id: this.generateId(),
      userId: this.data.currentUserId, // 現在のユーザーのIDを設定
      duration: this.editedTask.duration ?? 0 // durationがundefinedの場合は0を設定
    };
    await this.taskService.addTask(newTask); // Firestoreに複製
    this.dialogRef.close(newTask);
  }

  async duplicateAsMyTask() {
    const newTask: Task = {
      ...this.editedTask,
      id: this.generateId(),
      userId: this.data.currentUserId, // 現在のユーザーのIDを設定
      duration: this.editedTask.duration ?? 0 // durationがundefinedの場合は0を設定
    };
    await this.taskService.addTask(newTask); // Firestoreに複製
    this.dialogRef.close();
  }

  addSubtask() {
    if (this.isReadOnly) return; // 読み取り専用の場合は追加をブロック

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
    if (this.isReadOnly) return; // 読み取り専用の場合は削除をブロック

    if (this.editedTask.subtasks) {
      this.editedTask.subtasks.splice(index, 1);
    }
  }

  cancel() {
    this.editedTask.repeatSettings!.excludeDates = [...this.originalExcludeDates]; // 元の除外日リストに戻す
    this.dialogRef.close(this.originalTask);  // 元のタスクデータを返す
  }

  selectColor(color: string) {
    if (this.isReadOnly) return; // 読み取り専用の場合は色選択をブロック

    this.editedTask.tagColor = color;
  }

  addExcludeDate() {
    if (this.isReadOnly) return; // 読み取り専用の場合は追加をブロック

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
    if (this.isReadOnly) return; // 読み取り専用の場合は削除をブロック

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
