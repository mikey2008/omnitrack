'use client';

import React from 'react';
import { Search, Sparkles, User, BarChart3, LayoutDashboard, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavigationProps {
  onOpenCapture: (mode?: 'expense' | 'task' | 'academic' | 'scratchpad') => void;
  onOpenAuth: () => void;
  activeView?: 'cockpit' | 'analytics';
  onToggleView?: (view: 'cockpit' | 'analytics') => void;
  todayExpenseTotal: number;
  completedHabitsCount: number;
  totalHabitsCount: number;
}

export function Navigation({
  onOpenCapture,
  onOpenAuth,
  activeView = 'cockpit',
  onToggleView,
  todayExpenseTotal,
  completedHabitsCount,
  totalHabitsCount,
}: NavigationProps) {
  const { operatorName } = useAuth();

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  const progressPercent = totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#27272a] bg-[#000000]/90 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-white text-black font-black text-xs tracking-tighter">
              Ω
            </div>
            <span className="font-bold text-sm sm:text-base tracking-widest text-white uppercase">
              OmniTrack
            </span>
          </div>
          <span className="rounded-full border border-[#27272a] bg-[#09090b] px-2 py-0.5 text-[10px] font-mono text-[#a1a1aa]">
            v1.0
          </span>
        </div>

        {/* Center: Live Date & Sprint Progress */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-[#27272a] bg-[#09090b] px-3.5 py-1 text-xs">
          <span className="text-white font-medium">{todayFormatted}</span>
          <span className="text-[#3f3f46]">|</span>
          <div className="flex items-center gap-1.5 text-[#a1a1aa]">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span>Habits: <strong className="text-white">{completedHabitsCount}/{totalHabitsCount}</strong> ({progressPercent}%)</span>
          </div>
        </div>

        {/* Right: Quick Search Pill, Expense Tally & Master Operator Profile */}
        <div className="flex items-center gap-2.5">
          {/* Cmd+K trigger pill */}
          <button
            onClick={() => onOpenCapture()}
            className="flex items-center gap-2 rounded-lg border border-[#27272a] bg-[#09090b] hover:bg-[#18181b] hover:border-[#3f3f46] px-2.5 py-1.5 text-xs text-[#a1a1aa] transition-all cursor-pointer shadow-sm"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quick Capture</span>
            <kbd className="rounded border border-[#3f3f46] bg-[#18181b] px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
              Cmd K
            </kbd>
          </button>

          {/* Daily Expense Pill */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#27272a] bg-[#09090b] px-2.5 py-1.5 text-xs">
            <span className="text-[#71717a]">Today:</span>
            <span className="font-mono font-semibold text-white">₹{todayExpenseTotal.toFixed(2)}</span>
          </div>

          {/* Master Operator Profile Button */}
          <button
            onClick={onOpenAuth}
            className="flex h-7 items-center gap-1.5 rounded-full border border-amber-500/30 bg-[#120f08] px-2.5 text-xs text-amber-400 hover:border-amber-400 transition-all cursor-pointer"
          >
            <Crown className="h-3 w-3" />
            <span className="hidden sm:inline font-medium text-[11px]">
              {operatorName}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}
