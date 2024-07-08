// src\app\components\project-list\project-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';
import { Task } from '../../core/models/task.model';
import { Project } from '../../core/models/project.model';
import { User } from '../../core/models/user.model';
import { TaskAddComponent } from '../task-add/task-add.component';
import { ProjectAddComponent } from '../project-add/project-add.component';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { ProjectDetailComponent } from '../project-detail/project-detail.component';
import { AuthService } from '../../core/services/auth.service';

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
  membersMap: { [key: string]: User } = {};
  ownersMap: { [key: string]: User } = {};
  currentUserUid: string | null = null; // 現在のユーザーIDを保持
  uniqueTaskIds = new Set<string>(); // タスクの一意性を保つためのセット

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService,
    private authService: AuthService, // AuthServiceをインジェクト
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUserUid = user?.uid || null;
      this.loadProjects(); // ユーザーIDを取得後にプロジェクトをロード
    });
  }

  loadProjects() {
    console.log('Loading projects...');
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects.filter(project => 
        project.members.includes(this.currentUserUid!) || project.owners.includes(this.currentUserUid!)
      );
      console.log('Projects loaded:', this.projects);
      this.loadUsers();
      this.loadTasksForProjects();
    });
  }

  loadTasksForProjects() {
    console.log('Loading tasks for each project...');
    this.tasks = []; // タスクをリセット
    this.uniqueTaskIds.clear(); // 一意なタスクIDセットをクリア
    if (this.currentUserUid) {
      this.projects.forEach(project => {
        console.log(`User is a member or owner of project: ${project.id}`);
        this.loadTasksForUsersInProject(project.id, project.members.concat(project.owners));
      });

      // プロジェクト無所属のタスクをロード
      this.loadUnassignedTasks();
    }
  }

  loadTasksForUsersInProject(projectId: string, userIds: string[]) {
    userIds.forEach(userId => {
      this.taskService.getTasksByUserId(userId).subscribe(tasks => {
        tasks.forEach(task => {
          if (task.projectId === projectId && !this.uniqueTaskIds.has(task.id)) {
            this.uniqueTaskIds.add(task.id);
            this.tasks.push(task);
          }
        });
      });
    });
  }

  loadUnassignedTasks() {
    console.log('Loading unassigned tasks...');
    this.taskService.getTasksByUserId(this.currentUserUid!).subscribe(tasks => {
      tasks.forEach(task => {
        if (!task.projectId && !this.uniqueTaskIds.has(task.id)) {
          this.uniqueTaskIds.add(task.id);
          this.tasks.push(task);
        }
      });
      console.log('Unassigned tasks loaded:', this.tasks);
    });
  }

  loadUsers() {
    console.log('Loading users...');
    const uniqueMemberIds = new Set<string>();
    const uniqueOwnerIds = new Set<string>();

    this.projects.forEach(project => {
      if (project.members) {
        project.members.forEach(memberId => uniqueMemberIds.add(memberId));
      }
      if (project.owners) {
        project.owners.forEach(ownerId => uniqueOwnerIds.add(ownerId));
      }
    });

    const memberIds = Array.from(uniqueMemberIds);
    const ownerIds = Array.from(uniqueOwnerIds);

    console.log('Unique Member IDs:', memberIds);
    console.log('Unique Owner IDs:', ownerIds);

    memberIds.forEach(memberId => {
      this.userService.getUserById(memberId).subscribe(user => {
        if (user) {
          this.membersMap[memberId] = user;
          console.log('Added member to membersMap:', user);
        } else {
          console.log('User is undefined or has no UID:', user);
        }
      });
    });

    ownerIds.forEach(ownerId => {
      this.userService.getUserById(ownerId).subscribe(user => {
        if (user) {
          this.ownersMap[ownerId] = user;
          console.log('Added owner to ownersMap:', user);
        } else {
          console.log('User is undefined or has no UID:', user);
        }
      });
    });
  }

  openAddTaskDialog() {
    console.log('Opening Add Task Dialog...');
    const dialogRef = this.dialog.open(TaskAddComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Add Task Dialog closed with result:', result);
        this.loadTasksForProjects();
      }
    });
  }

  openAddProjectDialog() {
    console.log('Opening Add Project Dialog...');
    const dialogRef = this.dialog.open(ProjectAddComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Add Project Dialog closed with result:', result);
        this.loadProjects();
      }
    });
  }

  
  deleteSelectedTasks() {
    console.log('Deleting selected tasks...');
    const selectedTasks = this.tasks.filter(task => task.selected);
    const deletionPromises = selectedTasks.map(task => {
      const project = this.projects.find(p => p.id === task.projectId);
      console.log('Project found:', project);
      if (project && project.owners.includes(this.currentUserUid!)) {
        console.log('User is owner of the project, deleting task...');
        return this.taskService.deleteTask(task).then(() => {
          console.log('Deleted task:', task);
        }).catch(error => {
          console.error('Error deleting task:', error);
        });
      } else if (task.userId === this.currentUserUid) {
        console.log('User is the creator of the task, deleting task...');
        return this.taskService.deleteTask(task).then(() => {
          console.log('Deleted task:', task);
        }).catch(error => {
          console.error('Error deleting task:', error);
        });
      } else {
        console.warn('You do not have permission to delete this task:', task);
        return Promise.resolve(); // 権限がない場合もPromiseを返す
      }
    });
  
    Promise.all(deletionPromises).then(() => {
      this.loadTasksForProjects();
    }).catch(error => {
      console.error('Error in deleting tasks:', error);
    });
  }
  
  
  
  

  deleteSelectedProjects() {
    console.log('Deleting selected projects...');
    const selectedProjects = this.projects.filter(project => project.selected);
    selectedProjects.forEach(project => {
      const relatedTasks = this.getTasksForProject(project.id);
      relatedTasks.forEach(task => {
        this.taskService.deleteTask(task).then(() => {
          console.log('Deleted related task:', task);
          this.loadTasksForProjects();
        });
      });
      this.projectService.deleteProject(project).then(() => {
        console.log('Deleted project:', project);
        this.loadProjects();
      });
    });
  }

  openProjectDetailDialog(project: Project) {
    console.log('Opening Project Detail Dialog for project:', project);

    // ユーザーがオーナーかどうかを確認
    if (!this.currentUserUid || !project.owners.includes(this.currentUserUid)) {
      alert('このプロジェクトのオーナーではないため詳細を表示する権限がありません。');
      return;
    }

    this.dialog.closeAll(); // 既存の詳細ダイアログを閉じる

    const dialogRef = this.dialog.open(ProjectDetailComponent, {
      width: '600px',
      data: { project }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Project Detail Dialog closed with result:', result);
        this.loadProjects();
      }
    });
  }

  getTasksForProject(projectId: string): Task[] {
    return this.tasks.filter(task => task.projectId === projectId);
  }

  openTaskDetailDialog(task: Task) {
    console.log('Opening Task Detail Dialog for task:', task);
    this.dialog.closeAll(); // 既存の詳細ダイアログを閉じる

    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '600px',
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Task Detail Dialog closed with result:', result);
        this.loadTasksForProjects();
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

  canEdit(project: Project): boolean {
    return !!this.currentUserUid && project.owners.includes(this.currentUserUid);
  }
}
