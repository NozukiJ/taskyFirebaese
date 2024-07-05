import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { ReminderService } from '../../core/services/reminder.service';
import { ProjectService } from '../../core/services/project.service';
import { Task, Subtask, RepeatSettings } from '../../core/models/task.model';
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
  editedTask!: Task; // 編集用の一時的なタスク変数
  originalTask!: Task; // 元のタスクデータを保持するためのプロパティ
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
    console.log('TaskDetailComponent constructor called');
    if (data && data.task) {
      this.task = data.task;
      this.originalTask = { ...data.task }; // 元のデータを保持
      this.editedTask = { ...data.task, subtasks: [...data.task.subtasks] }; // 編集用にディープコピー
      console.log('TaskDetailComponent received task data:', this.task);
    } else {
      // タスクが提供されなかった場合に初期化
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
      this.originalTask = { ...this.task }; // 元のデータを保持
      this.editedTask = { ...this.task, subtasks: [...this.task.subtasks] }; // 編集用にディープコピー
      console.log('Task initialized to default:', this.task);
    }
  }

  ngOnInit(): void {
    console.log('TaskDetailComponent ngOnInit called');
    this.projects$ = this.projectService.getProjects();
    this.projects$.subscribe(projects => {
      this.projects = projects;
      console.log('Projects loaded:', this.projects);
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

    console.log('Loaded existing task:', this.editedTask);
  }

  async saveTask() {
    console.log('saveTask called');
<<<<<<< HEAD
    console.log('Task before save:', this.editedTask);
    
    if (this.editedTask.reminderTime && this.editedTask.reminderTime.value !== null) {
=======
    console.log('Task before save:', this.task);
    
    if (this.task.reminderTime && this.task.reminderTime.value !== null) {
>>>>>>> 2e967c177489ee8caff557b594694b0dcc04e1b1
      const timeBeforeStart = this.calculateReminderTime({
        value: this.editedTask.reminderTime.value,
        unit: this.editedTask.reminderTime.unit
      });
      this.reminderService.setReminder(this.editedTask, timeBeforeStart);
    }
  
    try {
<<<<<<< HEAD
      console.log('Task before update/add:', this.editedTask);
      if (this.editedTask.id) {
        await this.taskService.updateTask(this.editedTask); // 既存のタスクを更新
        console.log('Task updated:', this.editedTask);
=======
      console.log('Task before update/add:', this.task);
      if (this.task.id) {
        await this.taskService.updateTask(this.task); // 既存のタスクを更新
        console.log('Task updated:', this.task);
>>>>>>> 2e967c177489ee8caff557b594694b0dcc04e1b1
      } else {
        await this.taskService.addTask(this.editedTask); // 新しいタスクを追加
        console.log('New task added:', this.editedTask);
      }
      this.dialogRef.close(this.editedTask);  // ダイアログを閉じてタスクを返す
      console.log('Dialog closed with task:', this.editedTask);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async duplicateTask() {
    console.log('duplicateTask called');
    await this.taskService.duplicateTask(this.editedTask); // Firestoreに複製
    this.dialogRef.close();
    console.log('Dialog closed after duplicating task');
  }

  addSubtask() {
    console.log('addSubtask called');
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
    console.log('New subtask added:', newSubtask);
  }

  deleteSubtask(index: number) {
    console.log('deleteSubtask called');
    if (this.editedTask.subtasks) {
      this.editedTask.subtasks.splice(index, 1);
      console.log('Subtask deleted at index:', index);
    }
  }

  cancel() {
    console.log('cancel called');
    this.dialogRef.close(this.originalTask);  // 元のタスクデータを返す
    console.log('Dialog closed with original task:', this.originalTask);
  }

  selectColor(color: string) {
    this.editedTask.tagColor = color;
    console.log('Color selected:', color);
  }

  addExcludeDate() {
    console.log('addExcludeDate called');
<<<<<<< HEAD
    if (!this.editedTask.repeatSettings) {
      this.editedTask.repeatSettings = { frequency: 'none', businessDaysOnly: false, excludeDates: [] };
    }
    if (!this.editedTask.repeatSettings.excludeDates) {
      this.editedTask.repeatSettings.excludeDates = [];
    }
    if (this.excludeDate) {
      this.editedTask.repeatSettings.excludeDates.push(this.excludeDate);
      console.log('Exclude date before reset:', this.excludeDate);
      console.log('Updated exclude dates:', this.editedTask.repeatSettings.excludeDates);
=======
    if (!this.task.repeatSettings) {
      this.task.repeatSettings = { frequency: 'none', businessDaysOnly: false, excludeDates: [] };
    }
    if (!this.task.repeatSettings.excludeDates) {
      this.task.repeatSettings.excludeDates = [];
    }
    if (this.excludeDate) {
      this.task.repeatSettings.excludeDates.push(this.excludeDate);
      console.log('Exclude date before reset:', this.excludeDate);
      console.log('Updated exclude dates:', this.task.repeatSettings.excludeDates);
>>>>>>> 2e967c177489ee8caff557b594694b0dcc04e1b1
      this.excludeDate = '';
    }
  }

  removeExcludeDate(date: string) {
    console.log('removeExcludeDate called');
<<<<<<< HEAD
    if (this.editedTask.repeatSettings && this.editedTask.repeatSettings.excludeDates) {
      this.editedTask.repeatSettings.excludeDates = this.editedTask.repeatSettings.excludeDates.filter(d => d !== date);
      console.log('Exclude date removed:', date);
      console.log('Updated exclude dates:', this.editedTask.repeatSettings.excludeDates);
=======
    if (this.task.repeatSettings && this.task.repeatSettings.excludeDates) {
      this.task.repeatSettings.excludeDates = this.task.repeatSettings.excludeDates.filter(d => d !== date);
      console.log('Exclude date removed:', date);
      console.log('Updated exclude dates:', this.task.repeatSettings.excludeDates);
>>>>>>> 2e967c177489ee8caff557b594694b0dcc04e1b1
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
