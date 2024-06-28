import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { Task } from '../../core/models/task.model';
import { Project } from '../../core/models/project.model';
import { TaskAddComponent } from '../task-add/task-add.component';
import { ProjectAddComponent } from '../project-add/project-add.component';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { ProjectDetailComponent } from '../project-detail/project-detail.component'; // 追加

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  tasks: Task[] = [];
  noProjectSelected: boolean = false;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadProjects();
    this.loadTasks();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
  }

  loadTasks() {
    this.taskService.getTasks().subscribe((tasks: Task[]) => { // Task[] 型を明示
      this.tasks = tasks;
    });
  }

  openAddTaskDialog() {
    const dialogRef = this.dialog.open(TaskAddComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  openAddProjectDialog() {
    const dialogRef = this.dialog.open(ProjectAddComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects();
      }
    });
  }

  deleteSelectedTasks() {
    const selectedTasks = this.tasks.filter(task => task.selected);
    selectedTasks.forEach(task => {
      this.taskService.deleteTask(task).then(() => {
        this.loadTasks();
      });
    });
  }

  deleteSelectedProjects() {
    const selectedProjects = this.projects.filter(project => project.selected);
    selectedProjects.forEach(project => {
      // プロジェクトに関連するタスクを削除
      const relatedTasks = this.getTasksForProject(project.id);
      relatedTasks.forEach(task => {
        this.taskService.deleteTask(task).then(() => {
          this.loadTasks();
        });
      });
      // プロジェクトを削除
      this.projectService.deleteProject(project).then(() => {
        this.loadProjects();
      });
    });
  }

  openProjectDetailDialog(project: Project) {
    const dialogRef = this.dialog.open(ProjectDetailComponent, {
      width: '600px',
      data: { project }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects();
      }
    });
  }

  getTasksForProject(projectId: string): Task[] {
    return this.tasks.filter(task => task.projectId === projectId);
  }

  openTaskDetailDialog(task: Task) {
    // 既存のダイアログを全て閉じる
    this.dialog.closeAll();

    // 新しいタスク詳細ダイアログを開く
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '600px',
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
      }
    });
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
}