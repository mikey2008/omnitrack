'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, IndianRupee, CheckSquare, GraduationCap, StickyNote, Flame, CornerDownLeft } from 'lucide-react';
import { ExpenseCategory, PaymentMethod, TaskPriority } from '@/types/database';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'expense' | 'task' | 'academic' | 'scratchpad';
  onSaveExpense: (expense: { amount: number; category: ExpenseCategory; payment_method: PaymentMethod; note: string }) => void;
  onSaveTask: (task: { title: string; priority: TaskPriority; due_date?: string }) => void;
  onSaveAcademic: (item: { course_name: string; title: string; deadline: string }) => void;
  onSaveScratchpad: (note: string) => void;
}

export function QuickCaptureModal({
  isOpen,
  onClose,
  defaultMode = 'task',
  onSaveExpense,
  onSaveTask,
  onSaveAcademic,
  onSaveScratchpad,
}: QuickCaptureModalProps) {
  const [mode, setMode] = useState<'expense' | 'task' | 'academic' | 'scratchpad'>(defaultMode);
  const [inputText, setInputText] = useState('');
  
  // Expense Form State
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');

  // Task Form State
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('urgent');

  // Academic Form State
  const [courseName, setCourseName] = useState('DSA');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setInputText('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, defaultMode]);

  // Global keydown listeners for modal (Esc to close, Tab to switch modes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        const modes: ('task' | 'academic' | 'expense' | 'scratchpad')[] = ['task', 'academic', 'expense', 'scratchpad'];
        const nextIdx = (modes.indexOf(mode) + 1) % modes.length;
        setMode(modes[nextIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mode, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (mode === 'expense') {
      const matches = inputText.match(/(\d+(\.\d+)?)/);
      const amount = matches ? parseFloat(matches[1]) : 50;
      const note = inputText.replace(/(\d+(\.\d+)?)/, '').trim() || expenseCategory;
      onSaveExpense({ amount, category: expenseCategory, payment_method: paymentMethod, note });
    } else if (mode === 'task') {
      onSaveTask({ title: inputText.trim(), priority: taskPriority });
    } else if (mode === 'academic') {
      onSaveAcademic({ course_name: courseName, title: inputText.trim(), deadline: 'Tonight 23:59' });
    } else if (mode === 'scratchpad') {
      onSaveScratchpad(inputText.trim());
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl border border-[#27272a] bg-[#09090c] p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4 mb-4">
          <div className="flex rounded-lg border border-[#27272a] bg-[#000000] p-1 gap-1">
            <button
              onClick={() => setMode('task')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                mode === 'task' ? 'bg-white text-black font-semibold' : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              <CheckSquare className="h-3 w-3" />
              <span>Task</span>
            </button>

            <button
              onClick={() => setMode('academic')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                mode === 'academic' ? 'bg-white text-black font-semibold' : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              <GraduationCap className="h-3 w-3" />
              <span>Academic</span>
            </button>

            <button
              onClick={() => setMode('expense')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                mode === 'expense' ? 'bg-white text-black font-semibold' : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              <IndianRupee className="h-3 w-3" />
              <span>Expense</span>
            </button>

            <button
              onClick={() => setMode('scratchpad')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                mode === 'scratchpad' ? 'bg-white text-black font-semibold' : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              <StickyNote className="h-3 w-3" />
              <span>Scratchpad</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#71717a] hover:bg-[#18181b] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mode === 'task'
                  ? "What needs to be done? (e.g. 'Complete Graph Algorithms assignment')..."
                  : mode === 'expense'
                  ? "What did you spend? (e.g. '180 cold coffee & bagel')..."
                  : mode === 'academic'
                  ? "Course deliverable title (e.g. 'Dynamic Programming Problem Set')..."
                  : "Quick idea, temporary thought or code memo..."
              }
              className="w-full rounded-xl border border-[#27272a] bg-[#000000] px-4 py-3.5 text-sm text-white placeholder:text-[#71717a] focus:border-white focus:outline-none focus:ring-0"
            />
          </div>

          {/* Quick Dynamic Filter Chips */}
          {mode === 'task' && (
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-[11px] text-[#71717a]">Urgency:</span>
              {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTaskPriority(p)}
                  className={`rounded-full border px-3 py-0.5 text-[11px] uppercase font-mono font-semibold transition-all cursor-pointer ${
                    taskPriority === p
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-[#27272a] bg-[#000000] text-[#a1a1aa] hover:border-zinc-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {mode === 'expense' && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#71717a] mr-1">Category:</span>
                {(['food', 'transport', 'tech', 'bills', 'leisure'] as ExpenseCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setExpenseCategory(cat)}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-mono capitalize transition-all cursor-pointer ${
                      expenseCategory === cat
                        ? 'border-white bg-white text-black font-semibold'
                        : 'border-[#27272a] bg-[#000000] text-[#a1a1aa] hover:border-zinc-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#71717a] mr-1">Via:</span>
                {(['upi', 'cash', 'card'] as PaymentMethod[]).map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] uppercase font-mono transition-all cursor-pointer ${
                      paymentMethod === pm
                        ? 'border-white bg-white text-black font-semibold'
                        : 'border-[#27272a] bg-[#000000] text-[#a1a1aa] hover:border-zinc-500'
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'academic' && (
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-[11px] text-[#71717a]">Course:</span>
              {['Machine Learning', 'DSA', 'CS 421 Adv. Algorithms', 'CS 380 Operating Systems'].map((crs) => (
                <button
                  key={crs}
                  type="button"
                  onClick={() => setCourseName(crs)}
                  className={`rounded-full border px-3 py-0.5 text-[11px] font-mono transition-all cursor-pointer ${
                    courseName === crs
                      ? 'border-white bg-white text-black font-semibold'
                      : 'border-[#27272a] bg-[#000000] text-[#a1a1aa] hover:border-zinc-500'
                  }`}
                >
                  {crs}
                </button>
              ))}
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-[#27272a] pt-4 mt-4">
            <div className="flex items-center gap-3 text-[11px] text-[#71717a]">
              <span><kbd className="rounded border border-[#3f3f46] px-1 font-mono">esc</kbd> dismiss</span>
              <span><kbd className="rounded border border-[#3f3f46] px-1 font-mono">tab</kbd> switch mode</span>
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
            >
              <span>Save Entry</span>
              <CornerDownLeft className="h-3 w-3 stroke-[3]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
