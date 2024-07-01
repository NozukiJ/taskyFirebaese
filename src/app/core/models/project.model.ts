// src\app\core\models\project.model.ts
export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  color: string;
  tasks: string[]; // タスクのIDの配列
  members: string[]; // プロジェクトに参加するユーザーのIDリスト
  owners: string[]; // プロジェクトのオーナーのIDリスト
  selected?: boolean; // 追加
}
