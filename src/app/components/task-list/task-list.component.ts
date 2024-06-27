import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { Task, Subtask } from '../../core/models/task.model';
import { TaskAddComponent } from '../task-add/task-add.component';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { SubtaskDetailComponent } from '../subtask-detail/subtask-detail.component';
import { ProjectAddComponent } from '../project-add/project-add.component';
import { Project } from '../../core/models/project.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DragDropModule, TaskAddComponent],
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  projects: Project[] = [];
  tags: string[] = [];
  selectedTag: string = '';
  selectedPriority: string = '';
  selectedStatus: string = '全てのステータス';
  searchText: string = '';

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.tasks = this.taskService.getTasks();
    this.projects = this.projectService.getProjects();
    this.tags = this.getTags();
  }

  filteredTasks() {
    const searchTextLower = this.searchText.toLowerCase();
    return this.tasks.filter(task =>
      (this.selectedStatus === '全てのステータス' ||
       (this.selectedStatus === '未着手と進行中' && (task.status === '未着手' || task.status === '進行中')) ||
       this.selectedStatus === task.status) &&
      (task.title.toLowerCase().includes(searchTextLower) ||
       task.tag.toLowerCase().includes(searchTextLower) ||
       task.description.toLowerCase().includes(searchTextLower)) &&
      (this.selectedTag === '' || task.tag === this.selectedTag) &&
      (this.selectedPriority === '' || task.priority === this.selectedPriority)
    ).sort((a, b) => this.compareTasks(a, b));
  }

  sortTasks(criteria: keyof Task) {
    this.tasks.sort((a, b) => this.compareTasks(a, b, criteria));
  }

  compareTasks(a: Task, b: Task, criteria?: keyof Task): number {
    const priorityOrder: { [key: string]: number } = { 'high': 1, 'medium': 2, 'low': 3, '': 4 };

    if (criteria === 'priority') {
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.endDateTime).getTime() - new Date(b.endDateTime).getTime();
    }

    if (criteria === 'endDateTime') {
      return new Date(a.endDateTime).getTime() - new Date(b.endDateTime).getTime();
    }

    return 0;
  }

  drop(event: CdkDragDrop<Task[]>) {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
    this.taskService.saveTasks();
  }

  getTags() {
    const tags = this.tasks.map(task => task.tag);
    return Array.from(new Set(tags)).filter(tag => tag !== '');
  }

  deleteSelectedTasks() {
    this.tasks = this.tasks.filter(task => {
      if (task.selected) {
        this.taskService.deleteTask(task);
        return false;
      }
      task.subtasks = task.subtasks.filter(subtask => !subtask.selected);
      return true;
    });
    this.taskService.saveTasks();
  }

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'low':
        return '低';
      case 'medium':
        return '中';
      case 'high':
        return '高';
      default:
        return priority;
    }
  }

  getProjectName(projectId: string): string {
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : '';
  }

  openAddTaskDialog() {
    const dialogRef = this.dialog.open(TaskAddComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tasks = this.taskService.getTasks(); // 必要に応じて更新
      }
    });
  }

  openAddProjectDialog() { // 新しいプロジェクト追加ダイアログを開くメソッドを追加
    const dialogRef = this.dialog.open(ProjectAddComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projects = this.projectService.getProjects(); // プロジェクトリストを更新
      }
    });
  }

  openTaskDetailDialog(task: Task) {
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '400px',
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.saveTasks();
        this.tasks = this.taskService.getTasks();
      }
    });
  }

  openSubtaskDetailDialog(subtask: Subtask) {
    const dialogRef = this.dialog.open(SubtaskDetailComponent, {
      width: '400px',
      data: { subtask }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.saveTasks();
      }
    });
  }
}
