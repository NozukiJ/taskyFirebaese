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
  originalTask!: Task;  // 元のタスクデータを保持するためのプロパティ
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
      this.task = { ...data.task };  // データのコピーを作成
      this.originalTask = { ...data.task };  // 元のデータを保持
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

    if (!this.task.reminderTime) {
      this.task.reminderTime = {
        value: null,
        unit: '分'
      };
    }

    if (!this.task.subtasks) {
      this.task.subtasks = [];
    }

    console.log('Loaded existing task:', this.task);
  }

  async saveTask() {
    console.log('saveTask called');
    console.log('Task before save:', this.task);
    
    if (this.task.reminderTime && this.task.reminderTime.value !== null) {
      const timeBeforeStart = this.calculateReminderTime({
        value: this.task.reminderTime.value,
        unit: this.task.reminderTime.unit
      });
      this.reminderService.setReminder(this.task, timeBeforeStart);
    }
  
    try {
      console.log('Task before update/add:', this.task);
      if (this.task.id) {
        await this.taskService.updateTask(this.task); // 既存のタスクを更新
        console.log('Task updated:', this.task);
      } else {
        await this.taskService.addTask(this.task); // 新しいタスクを追加
        console.log('New task added:', this.task);
      }
      this.dialogRef.close(this.task);  // ダイアログを閉じてタスクを返す
      console.log('Dialog closed with task:', this.task);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async duplicateTask() {
    console.log('duplicateTask called');
    await this.taskService.duplicateTask(this.task); // Firestoreに複製
    this.dialogRef.close();
    console.log('Dialog closed after duplicating task');
  }

  addSubtask() {
    console.log('addSubtask called');
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
    console.log('New subtask added:', newSubtask);
  }

  deleteSubtask(index: number) {
    console.log('deleteSubtask called');
    if (this.task.subtasks) {
      this.task.subtasks.splice(index, 1);
      this.saveTask();
      console.log('Subtask deleted at index:', index);
    }
  }

  cancel() {
    console.log('cancel called');
    this.dialogRef.close(this.originalTask);  // 元のタスクデータを返す
    console.log('Dialog closed with original task:', this.originalTask);
  }

  selectColor(color: string) {
    this.task.tagColor = color;
    console.log('Color selected:', color);
  }

  addExcludeDate() {
    console.log('addExcludeDate called');
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
      this.excludeDate = '';
    }
  }

  removeExcludeDate(date: string) {
    console.log('removeExcludeDate called');
    if (this.task.repeatSettings && this.task.repeatSettings.excludeDates) {
      this.task.repeatSettings.excludeDates = this.task.repeatSettings.excludeDates.filter(d => d !== date);
      console.log('Exclude date removed:', date);
      console.log('Updated exclude dates:', this.task.repeatSettings.excludeDates);
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
