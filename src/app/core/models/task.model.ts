// src/app/core/models/task.model.ts
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  description: string;
  priority: 'low' | 'medium' | 'high'; // 型を修正
  startDateTime: string;
  endDateTime: string;
  tag: string;
  selected: boolean;
  tagColor: string;
  status: '未着手' | '進行中' | '完了'; // 型を修正
}

export interface RepeatSettings {
  frequency: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | 'monthlyFromEnd';
  daysOffsetFromEnd?: number;
  endDate?: string;
  daysOfWeek?: string[];
  businessDaysOnly?: boolean;
  excludeDates?: string[];
}

export interface Task extends Subtask {
  subtasks: Subtask[];
  duration: number; // durationを追加
  reminderTime?: { value: number | null, unit: '分' | '時間' | '日' | '週' };
  projectId?: string;
  repeatSettings?: RepeatSettings;
  userId: string; // 追加
}
