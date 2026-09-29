'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, X, StickyNote, Flame, Wifi, WifiOff, Filter } from 'lucide-react';
import { QuickCaptureModal } from '@/components/QuickCaptureModal';
import { AuthModal } from '@/components/AuthModal';
import { useOmniData } from '@/hooks/useOmniData';
import { calculateHabitStreak } from '@/lib/streakEngine';
import { enqueueOfflineMutation, getPendingMutations, removeMutation } from '@/lib/indexedDbQueue';

interface HabitItem {
  id: string;
  title: string;
  completed: boolean;
  history?: { log_date: string; completed: boolean }[];
}

interface TaskItem {
  id: string;
  title: string;
  tag: string;
  isUrgent: boolean;
  completed: boolean;
}

interface AcademicItem {
  id: string;
  code: string;
  subtitle: string;
  due: string;
  isUrgent: boolean;
}

interface CashFlowItem {
  id: string;
  title: string;
  amount: number;
  paymentMethod: string;
}

export default function FullyIntegratedOmniTrack() {
  const { addExpense, addTask, addAcademic, saveNote } = useOmniData();

  // Clock State
  const [timeStr, setTimeStr] = useState('00:00');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Network Online/Offline State (Phase 6 Mandate)
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = async () => {
      setIsOnline(true);
      // Drain offline IndexedDB queue
      const pending = await getPendingMutations();
      for (const item of pending) {
        await removeMutation(item.id);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Task Filter State (Phase 4 Eisenhower Hub)
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'urgent'>('active');

  // Quick Capture & Modals State
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [captureMode, setCaptureMode] = useState<'expense' | 'task' | 'academic' | 'scratchpad'>('task');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

  // Core State
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [academics, setAcademics] = useState<AcademicItem[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowItem[]>([]);
  const [scratchpadContent, setScratchpadContent] = useState('');

  // Inline Add Habit State
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  // Hydrate from LocalStorage
  useEffect(() => {
    try {
      const savedHabits = localStorage.getItem('omni_habits');
      const savedTasks = localStorage.getItem('omni_tasks');
      const savedAcademics = localStorage.getItem('omni_academics');
      const savedCashFlow = localStorage.getItem('omni_cashflow');
      const savedNotes = localStorage.getItem('omni_notes');

      if (savedHabits) setHabits(JSON.parse(savedHabits));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedAcademics) setAcademics(JSON.parse(savedAcademics));
      if (savedCashFlow) setCashFlow(JSON.parse(savedCashFlow));
      if (savedNotes) setScratchpadContent(savedNotes);
    } catch (e) {
      console.error('LocalStorage hydration error:', e);
    }
  }, []);

  // Persist State
  useEffect(() => {
    localStorage.setItem('omni_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('omni_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('omni_academics', JSON.stringify(academics));
  }, [academics]);

  useEffect(() => {
    localStorage.setItem('omni_cashflow', JSON.stringify(cashFlow));
  }, [cashFlow]);

  useEffect(() => {
    localStorage.setItem('omni_notes', scratchpadContent);
  }, [scratchpadContent]);

  // Global Cmd+K / Ctrl+K keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCaptureOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered Tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'active') return !t.completed;
    if (taskFilter === 'urgent') return t.isUrgent && !t.completed;
    return true;
  });

  const pendingTaskCount = tasks.filter((t) => !t.completed).length;
  const totalSpend = cashFlow.reduce((acc, curr) => acc + curr.amount, 0);

  // Habit Handlers with Streak Engine Calculation
  const handleToggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextState = !h.completed;
          const updatedHistory = [
            ...(h.history || []),
            { log_date: today, completed: nextState },
          ];
          return {
            ...h,
            completed: nextState,
            history: updatedHistory,
          };
        }
        return h;
      })
    );

    if (!navigator.onLine) {
      enqueueOfflineMutation({
        table_name: 'habit_logs',
        operation: 'INSERT',
        payload: { habit_id: id, log_date: today, completed: true },
      });
    }
  };

  const handleRemoveHabit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const handleAddHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    setHabits((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newHabitTitle.trim(), completed: false, history: [] },
    ]);
    setNewHabitTitle('');
    setIsAddingHabit(false);
  };

  // Task Handlers
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleRemoveTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen w-full bg-black text-white px-6 sm:px-12 lg:px-20 py-8 flex flex-col justify-start max-w-7xl mx-auto">
      
      {/* 1. TOP HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        {/* Left: Brand, Clock, Date & Offline Status */}
        <div className="flex flex-wrap items-baseline gap-4 sm:gap-6">
          <span className="text-lg font-bold tracking-tight text-white">OmniTrack</span>
          <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white">
            {timeStr}
          </span>
          <span className="text-xs sm:text-sm text-[#71717a] font-normal">
            {dateStr}
          </span>

          {!isOnline && (
            <span className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-950/20 px-2 py-0.5 text-[10px] font-mono text-amber-400">
              <WifiOff className="h-3 w-3" />
              <span>Offline Mode (IndexedDB Queue)</span>
            </span>
          )}
        </div>

        {/* Right: Scratchpad, Search & + New Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScratchpadOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#1f1f24] bg-[#0c0c0e] hover:bg-[#18181c] hover:border-[#2e2e36] px-3.5 py-2 text-xs text-[#a1a1aa] hover:text-white transition-all cursor-pointer"
            title="Open Scratchpad"
          >
            <StickyNote className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Scratchpad</span>
          </button>

          <button
            onClick={() => {
              setCaptureMode('task');
              setIsCaptureOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-[#1f1f24] bg-[#0c0c0e] hover:bg-[#18181c] hover:border-[#2e2e36] px-3.5 py-2 text-xs text-[#a1a1aa] transition-all cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 text-[#71717a]" />
            <span>Search</span>
            <kbd className="text-[10px] font-mono text-[#71717a] ml-1">⌘K</kbd>
          </button>

          <button
            onClick={() => {
              setCaptureMode('task');
              setIsCaptureOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-[#1f1f24] bg-[#0c0c0e] hover:bg-[#18181c] hover:border-[#2e2e36] px-4 py-2 text-xs font-medium text-white transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New</span>
          </button>
        </div>
      </header>

      {/* 2. HABIT ROW PILLS (With Linear Streak Counter Badges) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {habits.map((habit) => {
          const isDone = habit.completed;
          const streakData = calculateHabitStreak(habit.history || []);
          return (
            <div
              key={habit.id}
              onClick={() => handleToggleHabit(habit.id)}
              className={`group relative flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all cursor-pointer shrink-0 ${
                isDone
                  ? 'border-[#1f1f24] bg-[#0c0c0e] text-white hover:border-[#2e2e36]'
                  : 'border-[#1f1f24] bg-[#0c0c0e] text-[#a1a1aa] hover:border-[#2e2e36]'
              }`}
            >
              {isDone ? (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-black">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
              ) : (
                <div className="h-4 w-4 rounded-full border border-[#3f3f46]" />
              )}
              <span className={isDone ? 'text-white' : 'text-[#a1a1aa]'}>{habit.title}</span>

              {streakData.currentStreak > 0 && (
                <span className="flex items-center gap-0.5 rounded-full bg-[#18181b] border border-amber-500/20 px-1.5 py-0.2 text-[9px] font-mono text-amber-400">
                  <Flame className="h-2.5 w-2.5 fill-current" />
                  {streakData.currentStreak}d
                </span>
              )}

              <button
                onClick={(e) => handleRemoveHabit(habit.id, e)}
                title="Remove Habit"
                className="opacity-0 group-hover:opacity-100 ml-1 rounded-full p-0.5 text-[#71717a] hover:bg-red-950/50 hover:text-red-400 transition-all cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}

        {isAddingHabit ? (
          <form onSubmit={handleAddHabitSubmit} className="flex items-center gap-2 shrink-0">
            <input
              type="text"
              autoFocus
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              placeholder="e.g. Code C++, Workout..."
              className="rounded-xl border border-white/40 bg-[#0c0c0e] px-3 py-2 text-xs text-white placeholder:text-[#71717a] focus:outline-none w-44"
            />
            <button
              type="submit"
              className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-black hover:bg-zinc-200 cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingHabit(false)}
              className="rounded-xl border border-[#27272a] bg-[#0c0c0e] p-2 text-xs text-[#71717a] hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingHabit(true)}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-[#27272a] bg-transparent hover:border-[#3f3f46] hover:bg-[#0c0c0e] px-3.5 py-2.5 text-xs text-[#71717a] hover:text-white transition-all cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Habit</span>
          </button>
        )}
      </div>

      {/* 3. MAIN 2-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: TODAY'S PRIORITIES (Spans 7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#1c1c21] bg-[#09090c] p-6 flex flex-col justify-between min-h-[480px]">
          <div>
            {/* Monospace Subtitle & Filter Pills */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-mono tracking-widest text-[#71717a] uppercase">
                PRIORITIES // FOCUS
              </p>

              <div className="flex items-center rounded-lg border border-[#1c1c21] bg-[#000000] p-0.5 text-[11px]">
                <button
                  onClick={() => setTaskFilter('active')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    taskFilter === 'active' ? 'bg-[#1c1c21] text-white font-medium' : 'text-[#71717a]'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setTaskFilter('urgent')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    taskFilter === 'urgent' ? 'bg-[#1c1c21] text-amber-400 font-medium' : 'text-[#71717a]'
                  }`}
                >
                  Urgent
                </button>
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    taskFilter === 'all' ? 'bg-[#1c1c21] text-white font-medium' : 'text-[#71717a]'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            {/* Card Title & Pending Count */}
            <div className="flex items-center justify-between border-b border-[#1c1c21] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-amber-500" />
                <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                  Today&apos;s Priorities
                  <span className="text-amber-500">•</span>
                </h2>
              </div>

              <span className="text-xs font-mono text-[#71717a]">{pendingTaskCount} pending</span>
            </div>

            {/* Task List */}
            {filteredTasks.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#71717a]">
                <p>No priorities in this filter.</p>
                <p className="mt-1 text-[#52525b]">Press <kbd className="text-[10px] font-mono border border-[#27272a] px-1 py-0.5 rounded">⌘K</kbd> or click <strong>+ Add task</strong> below.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="group flex items-center justify-between gap-3 border-b border-[#141418] pb-4 last:border-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button className="text-[#3f3f46] group-hover:text-white transition-colors shrink-0">
                        {task.completed ? (
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-black">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-[#3f3f46] group-hover:border-white" />
                        )}
                      </button>

                      <p
                        className={`text-xs font-normal transition-colors leading-relaxed ${
                          task.completed ? 'line-through text-[#52525b]' : 'text-zinc-200 group-hover:text-white'
                        }`}
                      >
                        {task.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.isUrgent ? (
                        <span className="rounded-md bg-[#241705] border border-amber-500/20 px-2 py-0.5 text-[10px] font-mono text-amber-500 font-medium">
                          {task.tag}
                        </span>
                      ) : (
                        <span className="rounded-md bg-[#121215] px-2 py-0.5 text-[10px] font-mono text-[#71717a]">
                          {task.tag}
                        </span>
                      )}

                      <button
                        onClick={(e) => handleRemoveTask(task.id, e)}
                        title="Delete task"
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#52525b] hover:text-red-400 transition-all cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom + Add Task Trigger */}
          <div className="pt-4 border-t border-[#141418] mt-6">
            <button
              onClick={() => {
                setCaptureMode('task');
                setIsCaptureOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add task</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: ACADEMICS & CASH FLOW (Spans 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Top Right Card: ACADEMIC & SPRINTS (Phase 5 Deadline Escalations) */}
          <div className="rounded-2xl border border-[#1c1c21] bg-[#09090c] p-6">
            <p className="text-[10px] font-mono tracking-widest text-[#71717a] uppercase mb-1">
              ACADEMICS // DEADLINES
            </p>

            <div className="flex items-center justify-between border-b border-[#1c1c21] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-amber-500" />
                <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                  Academic &amp; Sprints
                  <span className="text-amber-500">•</span>
                </h2>
              </div>

              <span className="text-xs font-mono text-[#71717a]">{academics.length} items</span>
            </div>

            {academics.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#71717a]">
                <p>No upcoming academic sprints.</p>
                <button
                  onClick={() => {
                    setCaptureMode('academic');
                    setIsCaptureOpen(true);
                  }}
                  className="mt-2 text-xs text-zinc-300 hover:text-white underline cursor-pointer"
                >
                  + Add Deliverable
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {academics.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-2 border-b border-[#141418] pb-3 last:border-0"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-white tracking-tight">{item.code}</h4>
                      <p className="text-[11px] text-[#71717a] mt-0.5">{item.subtitle}</p>
                    </div>

                    <span
                      className={`text-[10px] font-mono shrink-0 ${
                        item.isUrgent ? 'text-amber-500 font-medium' : 'text-[#71717a]'
                      }`}
                    >
                      {item.due}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Right Card: CASH FLOW (Phase 5 Financial Ledger) */}
          <div className="rounded-2xl border border-[#1c1c21] bg-[#09090c] p-6">
            <p className="text-[10px] font-mono tracking-widest text-[#71717a] uppercase mb-1">
              FINANCE // CASH FLOW
            </p>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-amber-500" />
                <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                  Cash Flow
                  <span className="text-amber-500">•</span>
                </h2>
              </div>

              <span className="text-xs font-mono text-[#71717a]">TOTAL LOGGED</span>
            </div>

            {/* Dynamic Total Spend */}
            <div className="mb-5">
              <span className="text-3xl font-black font-mono tracking-tight text-white">
                ₹{totalSpend.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Transaction Rows */}
            {cashFlow.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#71717a]">
                <p>No expenses logged yet.</p>
                <button
                  onClick={() => {
                    setCaptureMode('expense');
                    setIsCaptureOpen(true);
                  }}
                  className="mt-2 text-xs text-zinc-300 hover:text-white underline cursor-pointer"
                >
                  + Log Expense
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-[#141418]">
                {cashFlow.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-normal">{tx.title}</span>
                    <span className="font-mono text-zinc-300">-₹{tx.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 4. SCRATCHPAD MODAL */}
      {isScratchpadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl rounded-2xl border border-[#27272a] bg-[#09090c] p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#27272a] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white tracking-wide uppercase">
                  Personal Scratchpad &amp; Notes
                </h3>
              </div>
              <button
                onClick={() => setIsScratchpadOpen(false)}
                className="rounded-lg p-1 text-[#71717a] hover:bg-[#18181b] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <textarea
              value={scratchpadContent}
              onChange={(e) => setScratchpadContent(e.target.value)}
              rows={12}
              placeholder="Write quick notes, code ideas, links, formulas, or temporary sprint goals..."
              className="w-full rounded-xl border border-[#1f1f24] bg-[#000000] p-4 text-xs font-mono text-zinc-200 placeholder:text-[#71717a] focus:border-white focus:outline-none focus:ring-0 leading-relaxed resize-none"
            />

            <div className="flex items-center justify-between pt-4 mt-2 text-xs text-[#71717a]">
              <span>Markdown supported • Persisted locally</span>
              <button
                onClick={() => {
                  saveNote(scratchpadContent);
                  setIsScratchpadOpen(false);
                }}
                className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-200 transition-all cursor-pointer"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. QUICK CAPTURE MODAL (PHASE 3) */}
      <QuickCaptureModal
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
        defaultMode={captureMode}
        onSaveExpense={(exp) => {
          setCashFlow((prev) => [
            { id: Date.now().toString(), title: exp.note || exp.category, amount: exp.amount, paymentMethod: exp.payment_method },
            ...prev,
          ]);
          addExpense(exp);
        }}
        onSaveTask={(tsk) => {
          setTasks((prev) => [
            { id: Date.now().toString(), title: tsk.title, tag: tsk.priority === 'urgent' ? 'Tonight 23:59' : 'Tomorrow', isUrgent: tsk.priority === 'urgent', completed: false },
            ...prev,
          ]);
          addTask(tsk);
        }}
        onSaveAcademic={(acad) => {
          setAcademics((prev) => [
            { id: Date.now().toString(), code: acad.course_name, subtitle: acad.title, due: acad.deadline, isUrgent: false },
            ...prev,
          ]);
          addAcademic(acad);
        }}
        onSaveScratchpad={(memo) => {
          setScratchpadContent((prev) => prev ? `${prev}\n\n${memo}` : memo);
          saveNote(memo);
        }}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

    </div>
  );
}
