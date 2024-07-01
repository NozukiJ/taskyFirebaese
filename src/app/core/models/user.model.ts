// src\app\core\models\user.model.ts
export interface User {
    id?: string; // 追加：FirebaseのドキュメントID
    uid: string; // ユーザーID
    email: string;
    displayName: string;
    projectIds: string[]; // ユーザーが参加しているプロジェクトのIDリスト
    selected?: boolean; // 追加：ユーザー選択状態
  }
  