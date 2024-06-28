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
    this.taskService.getTasks().subscribe(tasks => {
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
      this.projectService.deleteProject(project).then(() => {
        this.loadProjects();
      });
    });
  }

  updateProjectName(project: Project, event: any) {
    project.name = event.target.innerText;
    this.projectService.updateProject(project);
  }

  getTasksForProject(projectId: string): Task[] {
    return this.tasks.filter(task => task.projectId === projectId);
  }

  openTaskDetailDialog(task: Task) {
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '400px',
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
