// src/types/task.ts

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO 8601
}

export type CreateTaskInput = Pick<Task, "title">;
