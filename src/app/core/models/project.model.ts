export interface Project {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    color: string;
    tasks: string[]; // タスクのIDの配列
    selected?: boolean; // 追加
  }
  