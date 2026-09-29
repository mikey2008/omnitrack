'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import {
  Task,
  Habit,
  HabitLog,
  Academic,
  Expense,
  Project,
  Note,
  TaskPriority,
  ExpenseCategory,
  PaymentMethod,
} from '@/types/database';

export function useOmniData() {
  const { user } = useAuth();
  const supabase = createClient();

  // Initial Seed State (for instant UI render & fallback)
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', title: 'Code C++', streak_count: 14, completed_today: true, created_at: new Date().toISOString() },
    { id: '2', title: 'Gym / Workout', streak_count: 5, completed_today: false, created_at: new Date().toISOString() },
    { id: '3', title: 'Read 20m', streak_count: 22, completed_today: true, created_at: new Date().toISOString() },
    { id: '4', title: 'Drink 3L Water', streak_count: 9, completed_today: false, created_at: new Date().toISOString() },
    { id: '5', title: 'Review DSA', streak_count: 18, completed_today: true, created_at: new Date().toISOString() },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Submit Distributed Systems Lab Report', priority: 'urgent', status: 'pending', due_date: 'Tonight 11:59 PM', created_at: new Date().toISOString() },
    { id: '2', title: 'Review PR for Supabase RLS Migration', priority: 'high', status: 'pending', due_date: 'Tomorrow 2:00 PM', created_at: new Date().toISOString() },
    { id: '3', title: 'Refactor PostgREST JWT Authentication Hook', priority: 'medium', status: 'in_progress', due_date: 'Oct 02', created_at: new Date().toISOString() },
    { id: '4', title: 'Setup IndexedDB outbox queue drain worker', priority: 'low', status: 'completed', due_date: 'Completed', created_at: new Date().toISOString() },
  ]);

  const [academics, setAcademics] = useState<Academic[]>([
    { id: '1', course_name: 'CS-401', title: 'Distributed Systems Raft Consensus Project', type: 'project', status: 'todo', deadline: 'Tonight 11:59 PM', syllabus_url: 'https://github.com', created_at: new Date().toISOString() },
    { id: '2', course_name: 'ML-302', title: 'Gradient Boosting & Neural Networks Quiz', type: 'quiz', status: 'todo', deadline: 'Due in 2 days', created_at: new Date().toISOString() },
    { id: '3', course_name: 'SYS-201', title: 'Kernel Memory Allocator Benchmark', type: 'assignment', status: 'todo', deadline: 'Due Oct 05', created_at: new Date().toISOString() },
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', amount: 180, category: 'food', payment_method: 'upi', note: 'Cold coffee & bagel', expense_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() },
    { id: '2', amount: 45, category: 'transport', payment_method: 'upi', note: 'Metro ride to campus', expense_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() },
    { id: '3', amount: 220, category: 'food', payment_method: 'card', note: 'Lunch with study group', expense_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() },
  ]);

  const [projects, setProjects] = useState<Project[]>([
    { id: '1', title: 'omnitrack-life-os', repo_url: 'https://github.com', commit_count: 48, tech_stack: ['Next.js 15', 'Supabase', 'Tailwind'], active_milestone: 'Sprint 1: Core Engine & Ingestion', status: 'active', created_at: new Date().toISOString() },
    { id: '2', title: 'distributed-raft-kv', repo_url: 'https://github.com', commit_count: 112, tech_stack: ['Go', 'gRPC', 'Protobuf'], active_milestone: 'Leader election verification', status: 'active', created_at: new Date().toISOString() },
  ]);

  const [note, setNote] = useState<Note>({
    id: '1',
    title: 'Sprint Goals',
    content: `# Sprint Goal: Complete Distributed Consensus\n- [x] Read Raft Paper (Ongaro & Ousterhout)\n- [ ] Implement leader election RPC in Go\n- [ ] Write mock RPC failure tests\n\n\`\`\`go\nfunc (rf *Raft) RequestVote(args *RequestVoteArgs, reply *RequestVoteReply) {\n    // Zero-overhead state transition\n}\n\`\`\``,
    is_pinned: true,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });

  // Fetch from Supabase if user is logged in
  const fetchData = useCallback(async () => {
    if (!supabase || !user) return;

    try {
      const [tasksRes, habitsRes, expensesRes, academicsRes, projectsRes, notesRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('habits').select('*').order('created_at', { ascending: true }),
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('academics').select('*').order('deadline', { ascending: true }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('notes').select('*').order('updated_at', { ascending: false }).limit(1),
      ]);

      if (tasksRes.data && tasksRes.data.length > 0) setTasks(tasksRes.data);
      if (habitsRes.data && habitsRes.data.length > 0) setHabits(habitsRes.data);
      if (expensesRes.data && expensesRes.data.length > 0) setExpenses(expensesRes.data);
      if (academicsRes.data && academicsRes.data.length > 0) setAcademics(academicsRes.data);
      if (projectsRes.data && projectsRes.data.length > 0) setProjects(projectsRes.data);
      if (notesRes.data && notesRes.data.length > 0) setNote(notesRes.data[0]);
    } catch (err) {
      console.error('Error hydrating Supabase data:', err);
    }
  }, [supabase, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Optimistic Mutators (<50ms feedback)
  const toggleHabit = async (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const nextState = !h.completed_today;
          return {
            ...h,
            completed_today: nextState,
            streak_count: nextState ? (h.streak_count || 0) + 1 : Math.max(0, (h.streak_count || 1) - 1),
          };
        }
        return h;
      })
    );

    if (supabase && user) {
      const today = new Date().toISOString().split('T')[0];
      const habit = habits.find((h) => h.id === habitId);
      if (habit?.completed_today) {
        await supabase.from('habit_logs').delete().match({ habit_id: habitId, log_date: today });
      } else {
        await supabase.from('habit_logs').upsert({ habit_id: habitId, log_date: today, completed: true });
      }
    }
  };

  const toggleTask = async (taskId: string) => {
    let nextStatus: Task['status'] = 'completed';
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );

    if (supabase && user) {
      await supabase.from('tasks').update({ status: nextStatus }).eq('id', taskId);
    }
  };

  const addExpense = async (payload: { amount: number; category: ExpenseCategory; payment_method: PaymentMethod; note: string }) => {
    const tempId = Date.now().toString();
    const newExpense: Expense = {
      id: tempId,
      ...payload,
      expense_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    if (supabase && user) {
      const { data } = await supabase.from('expenses').insert({
        amount: payload.amount,
        category: payload.category,
        payment_method: payload.payment_method,
        note: payload.note,
        user_id: user.id,
      }).select().single();

      if (data) {
        setExpenses((prev) => prev.map((e) => (e.id === tempId ? data : e)));
      }
    }
  };

  const addTask = async (payload: { title: string; priority: TaskPriority; due_date?: string }) => {
    const tempId = Date.now().toString();
    const newTask: Task = {
      id: tempId,
      title: payload.title,
      priority: payload.priority,
      status: 'pending',
      due_date: payload.due_date || 'Due soon',
      created_at: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    if (supabase && user) {
      const { data } = await supabase.from('tasks').insert({
        title: payload.title,
        priority: payload.priority,
        status: 'pending',
        user_id: user.id,
      }).select().single();

      if (data) {
        setTasks((prev) => prev.map((t) => (t.id === tempId ? data : t)));
      }
    }
  };

  const addAcademic = async (payload: { course_name: string; title: string; deadline: string }) => {
    const tempId = Date.now().toString();
    const newAcad: Academic = {
      id: tempId,
      course_name: payload.course_name,
      title: payload.title,
      type: 'assignment',
      status: 'todo',
      deadline: payload.deadline,
      created_at: new Date().toISOString(),
    };

    setAcademics((prev) => [newAcad, ...prev]);

    if (supabase && user) {
      const { data } = await supabase.from('academics').insert({
        course_name: payload.course_name,
        title: payload.title,
        deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        user_id: user.id,
      }).select().single();

      if (data) {
        setAcademics((prev) => prev.map((a) => (a.id === tempId ? data : a)));
      }
    }
  };

  const saveNote = async (content: string) => {
    setNote((prev) => ({ ...prev, content, updated_at: new Date().toISOString() }));

    if (supabase && user) {
      await supabase.from('notes').upsert({
        user_id: user.id,
        title: 'Sprint Goals',
        content,
        is_pinned: true,
      });
    }
  };

  return {
    habits,
    setHabits,
    tasks,
    setTasks,
    academics,
    setAcademics,
    expenses,
    setExpenses,
    projects,
    setProjects,
    note,
    toggleHabit,
    toggleTask,
    addExpense,
    addTask,
    addAcademic,
    saveNote,
  };
}
