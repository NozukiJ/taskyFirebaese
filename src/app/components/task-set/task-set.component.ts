import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskSetService } from '../../core/services/taskSet.service';
import { IntervalSetService } from '../../core/services/intervalSet.service';
import { TaskService } from '../../core/services/task.service';
import { TaskSet } from '../../core/models/taskSet.model';
import { IntervalSet } from '../../core/models/intervalSet.model';
import { Task } from '../../core/models/task.model';
import { TaskSetTaskDetailComponent } from '../task-set-task-detail/task-set-task-detail.component';
import { TaskSetAddComponent } from '../task-set-add/task-set-add.component';
import { IntervalSetAddComponent } from '../interval-set-add/interval-set-add.component';
import { IntervalSetEditComponent } from '../interval-set-edit/interval-set-edit.component';

@Component({
  selector: 'app-task-set',
  templateUrl: './task-set.component.html',
  styleUrls: ['./task-set.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule]
})
export class TaskSetComponent implements OnInit {
  taskSets: TaskSet[] = [];
  intervalSets: IntervalSet[] = [];
  newTaskSetName: string = '';
  newIntervalSetName: string = '';
  selectedTaskSetId: string | null = null;
  selectedTaskSet: TaskSet | null = null;
  selectedIntervalSetId: string | null = null;
  selectedIntervalSet: IntervalSet | null = null;
  intervals: any[] = [];
  tasks: Task[] = [];
  taskSetDurations: { [key: string]: number } = {};
  selectedStartDateTime: string | null = null;

  constructor(
    private taskSetService: TaskSetService,
    private intervalSetService: IntervalSetService,
    private taskService: TaskService,
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
      this.taskSets.forEach(taskSet => taskSet.isEditing = false);
      this.taskSets.forEach(taskSet => this.calculateTaskSetDuration(taskSet.id));
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
      this.intervalSets.forEach(intervalSet => intervalSet.isEditing = false);
      if (this.selectedIntervalSetId) {
        this.selectedIntervalSet = this.intervalSets.find(intervalSet => intervalSet.id === this.selectedIntervalSetId) || null;
        if (this.selectedIntervalSet) {
          this.loadIntervalsForIntervalSet(this.selectedIntervalSet.id);
        }
      }
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
      this.calculateTaskSetDuration(taskSetId); // タスクをロードした後に合計時間を計算
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
    this.loadIntervalsForIntervalSet(intervalSet.id);
  }

  loadIntervalsForIntervalSet(intervalSetId: string) {
    this.intervalSetService.getIntervalsForIntervalSet(intervalSetId).subscribe((intervals: any) => {
      this.intervals = intervals;
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

  deleteSelectedTasks() {
    if (this.selectedTaskSet) {
      const selectedTasks = this.tasks.filter(task => task.selected);
      const deletePromises = selectedTasks.map(task => this.taskSetService.deleteTaskFromTaskSet(this.selectedTaskSet!.id, task.id));
      Promise.all(deletePromises).then(() => {
        this.loadTasksForTaskSet(this.selectedTaskSet!.id);
      });
    }
  }

  deleteSelectedIntervals() {
    if (this.selectedIntervalSet) {
      const selectedIntervals = this.intervals.filter(interval => interval.selected);
      const deletePromises = selectedIntervals.map(interval => this.intervalSetService.deleteIntervalFromIntervalSet(this.selectedIntervalSet!.id, interval.id));
      Promise.all(deletePromises).then(() => {
        this.loadIntervalsForIntervalSet(this.selectedIntervalSet!.id);
      });
    }
  }

  editTaskSetName(taskSet: TaskSet) {
    taskSet.isEditing = true;
  }

  saveTaskSetName(taskSet: TaskSet) {
    taskSet.isEditing = false;
    this.taskSetService.updateTaskSet(taskSet).then(() => {
      this.loadTaskSets();
    });
  }

  editIntervalSetName(intervalSet: IntervalSet) {
    intervalSet.isEditing = true;
  }

  saveIntervalSetName(intervalSet: IntervalSet) {
    intervalSet.isEditing = false;
    this.intervalSetService.updateIntervalSet(intervalSet).then(() => {
      this.loadIntervalSets();
    });
  }

  onTaskSetChange() {
    const selectedTaskSet = this.taskSets.find(taskSet => taskSet.id === this.selectedTaskSetId) || null;
    if (selectedTaskSet) {
      this.selectedTaskSet = selectedTaskSet;
      this.loadTasksForTaskSet(selectedTaskSet.id);
    }
  }

  onIntervalSetChange() {
    this.selectedIntervalSet = this.intervalSets.find(intervalSet => intervalSet.id === this.selectedIntervalSetId) || null;
    if (this.selectedIntervalSet) {
      this.loadIntervalsForIntervalSet(this.selectedIntervalSet.id);
    }
  }

  openAddIntervalToSetDialog(intervalSet: IntervalSet) {
    const dialogRef = this.dialog.open(IntervalSetAddComponent, {
      width: '400px',
      data: { intervalSetId: intervalSet.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadIntervalsForIntervalSet(intervalSet.id);
      }
    });
  }

  openEditIntervalDialog(interval: IntervalSet) {
    const dialogRef = this.dialog.open(IntervalSetEditComponent, {
      width: '400px',
      data: { intervalSetId: this.selectedIntervalSet?.id, interval }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadIntervalsForIntervalSet(this.selectedIntervalSet?.id || '');
      }
    });
  }

  toggleSelectAllTasks(event: any) {
    const isChecked = event.target.checked;
    this.tasks.forEach(task => task.selected = isChecked);
  }

 
  addSelectedTasksToTaskList(): void {
    if (!this.selectedTaskSet) {
      return;
    }
  
    const selectedTasks = this.tasks.filter(task => task.selected).map(task => {
      const newTask: any = { ...task, selected: false }; // selectedをfalseに設定
      if (newTask.id) { // idが存在する場合にのみ削除
        delete newTask.id;
      }
      return newTask;
    });
  
    if (selectedTasks.length > 0) {
      this.taskService.addTasksBatch(selectedTasks).then(() => {
        console.log('Selected tasks added to task list');
      }).catch(error => {
        console.error('Error adding selected tasks to task list:', error);
      });
    }
  }
  
  
  
  

  calculateTaskSetDuration(taskSetId: string) {
    this.taskSetService.getTasksForTaskSet(taskSetId).subscribe((data: any) => {
      const tasks: Task[] = data as Task[];
      const totalDuration = tasks.reduce((sum, task) => sum + (task.duration || 0), 0);
      this.taskSetDurations[taskSetId] = totalDuration;
    });
  }

  applyStartDateTimeToTaskSet() {
    if (!this.selectedStartDateTime || !this.selectedTaskSet) {
      return;
    }

    const startDateTime = new Date(this.selectedStartDateTime);
    let currentDateTime = startDateTime;

    for (let task of this.tasks) {
      task.startDateTime = currentDateTime.toISOString();
      const endDateTime = new Date(currentDateTime.getTime() + (task.duration * 60000));
      task.endDateTime = endDateTime.toISOString();
      currentDateTime = endDateTime;

      this.taskService.updateTask(task).then(() => {
        console.log(`Task ${task.title} updated with new start and end times`);
      }).catch(error => {
        console.error('Error updating task:', error);
      });
    }
  }
}
