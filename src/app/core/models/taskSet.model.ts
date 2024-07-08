// src/app/core/models/taskSet.model.ts
import { Task } from './task.model';

export interface TaskSet {
    id: string;
    name: string;
    tasks: Task[];
    selected?: boolean;
  }