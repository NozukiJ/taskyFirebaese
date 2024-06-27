import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { TaskAddComponent } from '../task-add/task-add.component';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { ProjectAddComponent } from '../project-add/project-add.component';
import { Project } from '../../core/models/project.model';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'app-project-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectTaskListComponent implements OnInit {
  tasks: Task[] = [];
  projects: Project[] = [];
  tags: string[] = [];
  noProjectSelected: boolean = false;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.tasks = this.taskService.getTasks();
    this.projects = this.projectService.getProjects().map(project => ({
      ...project,
      selected: false  // 初期値を設定
    }));
    this.tags = this.getTags();
  }

  getTasksForProject(projectId: string): Task[] {
    if (projectId === '') {
      return this.tasks.filter(task => !task.projectId);
    }
    return this.tasks.filter(task => task.projectId === projectId);
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

  deleteSelectedProjects() {
    this.projects = this.projects.filter(project => {
      if (project.selected) {
        this.projectService.deleteProject(project);
        return false;
      }
      return true;
    });
    this.tasks = this.taskService.getTasks();  // 更新されたプロジェクトに基づいてタスクを再取得
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

  updateProjectName(project: Project, event: Event) {
    const newName = (event.target as HTMLElement).innerText;
    if (newName.trim() && newName !== project.name) {
      project.name = newName.trim();
      this.projectService.updateProject(project); // プロジェクトの名前を更新
    }
  }

  openAddTaskDialog() {
    const dialogRef = this.dialog.open(TaskAddComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tasks = this.taskService.getTasks();
      }
    });
  }

  openAddProjectDialog() {
    const dialogRef = this.dialog.open(ProjectAddComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projects = this.projectService.getProjects();
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
}
