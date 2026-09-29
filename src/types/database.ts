export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type ExpenseCategory = 'food' | 'transport' | 'tech' | 'bills' | 'leisure' | 'other';
export type PaymentMethod = 'upi' | 'cash' | 'card';
export type AcademicType = 'assignment' | 'lecture' | 'quiz' | 'exam' | 'project';
export type AcademicStatus = 'todo' | 'submitted' | 'graded';

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Habit {
  id: string;
  user_id?: string;
  title: string;
  category?: string;
  target_frequency?: string;
  streak_count?: number;
  completed_today?: boolean;
  archived?: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  user_id?: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
}

export interface Academic {
  id: string;
  user_id?: string;
  course_name: string;
  title: string;
  type: AcademicType;
  status: AcademicStatus;
  deadline: string;
  syllabus_url?: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id?: string;
  amount: number;
  category: ExpenseCategory;
  payment_method: PaymentMethod;
  note?: string | null;
  expense_date: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id?: string;
  title: string;
  repo_url?: string | null;
  commit_count: number;
  tech_stack: string[];
  active_milestone?: string | null;
  status: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  is_pinned: boolean;
  updated_at: string;
  created_at: string;
}
