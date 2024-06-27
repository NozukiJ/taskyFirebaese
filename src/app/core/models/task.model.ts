export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
    description: string;
    priority: string;
    startDateTime: string;
    endDateTime: string;
    tag: string;
    selected: boolean;
    tagColor: string;
    status: string;
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
    reminderTime?: { value: number | null, unit: '分' | '時間' | '日' | '週' };
    projectId?: string;
    repeatSettings?: RepeatSettings;
  }
  