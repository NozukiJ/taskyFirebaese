import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TaskSetService } from '../../core/services/taskSet.service'; // パスを確認
import { IntervalSetService } from '../../core/services/intervalSet.service'; // パスを確認
import { TaskSet } from '../../core/models/taskSet.model';
import { IntervalSet } from '../../core/models/intervalSet.model';
import { Task } from '../../core/models/task.model';
import { TaskSetTaskDetailComponent } from '../task-set-task-detail/task-set-task-detail.component';
import { TaskSetAddComponent } from '../task-set-add/task-set-add.component';

@Component({
  selector: 'app-task-set',
  templateUrl: './task-set.component.html',
  styleUrls: ['./task-set.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TaskSetComponent implements OnInit {
  taskSets: TaskSet[] = [];
  intervalSets: IntervalSet[] = [];
  newTaskSetName: string = '';
  newIntervalSetName: string = '';
  selectedTaskSetId: string | null = null;
  selectedTaskSet: TaskSet | null = null;
  selectedIntervalSet: IntervalSet | null = null;
  tasks: Task[] = []; // 選択されたタスクセットのタスクを格納する配列

  constructor(
    private taskSetService: TaskSetService,
    private intervalSetService: IntervalSetService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    Promise.all([
      this.taskSetService.waitForUserId(),
      this.intervalSetService.waitForUserId()
    ]).then(() => {
      this.loadTaskSets();
      this.loadIntervalSets();
    });
  }

  loadTaskSets() {
    this.taskSetService.getTaskSets().subscribe((taskSets: any) => {
      this.taskSets = taskSets as TaskSet[];
      if (this.selectedTaskSetId) {
        this.selectedTaskSet = this.taskSets.find(taskSet => taskSet.id === this.selectedTaskSetId) || null;
        if (this.selectedTaskSet) {
          this.loadTasksForTaskSet(this.selectedTaskSet.id);
        }
      }
    });
  }

  loadIntervalSets() {
    this.intervalSetService.getIntervalSets().subscribe((intervalSets: any) => {
      this.intervalSets = intervalSets as IntervalSet[];
    });
  }

  createTaskSet() {
    const newTaskSet: TaskSet = { id: '', name: this.newTaskSetName, tasks: [] };
    this.taskSetService.createTaskSet(newTaskSet).then(() => {
      this.newTaskSetName = '';
      this.loadTaskSets();
    });
  }

  deleteTaskSet(taskSet: TaskSet) {
    this.taskSetService.deleteTaskSet(taskSet).then(() => {
      this.loadTaskSets();
    });
  }

  selectTaskSet(taskSet: TaskSet) {
    this.selectedTaskSet = taskSet;
    this.loadTasksForTaskSet(taskSet.id);
  }

  loadTasksForTaskSet(taskSetId: string) {
    this.taskSetService.getTasksForTaskSet(taskSetId).subscribe((tasks: any) => {
      this.tasks = tasks as Task[];
    });
  }

  openAddTaskToSetDialog(taskSet: TaskSet) {
    const dialogRef = this.dialog.open(TaskSetAddComponent, {
      width: '400px',
      data: { taskSetId: taskSet.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasksForTaskSet(taskSet.id);
      }
    });
  }

  openTaskDetailDialog(task: Task) {
    const dialogRef = this.dialog.open(TaskSetTaskDetailComponent, {
      width: '600px',
      data: { task, taskSetId: this.selectedTaskSet?.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.selectedTaskSet) {
        this.loadTasksForTaskSet(this.selectedTaskSet.id);
      }
    });
  }

  createIntervalSet() {
    const newIntervalSet: IntervalSet = { id: '', name: this.newIntervalSetName, intervals: [] };
    this.intervalSetService.createIntervalSet(newIntervalSet).then(() => {
      this.newIntervalSetName = '';
      this.loadIntervalSets();
    });
  }

  deleteIntervalSet(intervalSet: IntervalSet) {
    this.intervalSetService.deleteIntervalSet(intervalSet).then(() => {
      this.loadIntervalSets();
    });
  }

  selectIntervalSet(intervalSet: IntervalSet) {
    this.selectedIntervalSet = intervalSet;
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
