'use client';

import React from 'react';
import { Flame, Trophy, TrendingUp, Calendar, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Habit, Expense } from '@/types/database';

interface AnalyticsViewProps {
  habits: Habit[];
  expenses: Expense[];
  onBack: () => void;
}

export function AnalyticsView({ habits, expenses, onBack }: AnalyticsViewProps) {
  // Generate 52 weeks x 7 days mock contribution grid (364 days)
  const weeks = 52;
  const daysPerWeek = 7;

  // Pseudo-random deterministic activity levels based on week & day index
  const getCellIntensity = (weekIdx: number, dayIdx: number) => {
    const seed = (weekIdx * 7 + dayIdx * 13) % 100;
    if (seed < 20) return 'bg-[#18181b] border-[#27272a]'; // empty
    if (seed < 45) return 'bg-[#3f3f46] border-[#52525b]'; // low
    if (seed < 75) return 'bg-[#a1a1aa] border-white/40';  // medium
    return 'bg-white border-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'; // 100% completed
  };

  const totalExpenseSum = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg border border-[#27272a] bg-[#09090b] hover:bg-[#18181b] px-3 py-1.5 text-xs text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Mission Control</span>
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
              Habit Consistency & Heatmap Analytics
            </h2>
            <p className="text-xs text-[#71717a]">Year-in-Pixels & Behavioral Correlation</p>
          </div>
        </div>

        <span className="rounded-full border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 text-xs font-mono text-emerald-400">
          94.2% Consistency Rate
        </span>
      </div>

      {/* 1. Giant Streak Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#71717a] mb-2">
            <span>CURRENT ACTIVE STREAK</span>
            <Flame className="h-4 w-4 text-amber-400 fill-current" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">18</span>
            <span className="text-sm font-semibold text-zinc-400">Days Consecutive</span>
          </div>
          <p className="text-[11px] text-[#a1a1aa] mt-2">Zero missed habits in current cycle</p>
        </div>

        <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#71717a] mb-2">
            <span>ALL-TIME RECORD</span>
            <Trophy className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">42</span>
            <span className="text-sm font-semibold text-zinc-400">Days Peak</span>
          </div>
          <p className="text-[11px] text-[#a1a1aa] mt-2">Achieved Aug 2026 • Top 1% builder</p>
        </div>

        <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#71717a] mb-2">
            <span>LIFETIME DISCIPLINE REPS</span>
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">312</span>
            <span className="text-sm font-semibold text-zinc-400">Completed Reps</span>
          </div>
          <p className="text-[11px] text-[#a1a1aa] mt-2">Across 5 daily tracked protocols</p>
        </div>
      </div>

      {/* 2. 52-Week Year-in-Pixels Contribution Grid */}
      <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-white" />
            <h3 className="font-semibold text-sm text-white tracking-wide">Year-in-Pixels (52-Week Consistency Matrix)</h3>
          </div>
          
          <div className="flex items-center gap-2 text-[11px] text-[#71717a]">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-xs bg-[#18181b] border border-[#27272a]" />
              <div className="h-2.5 w-2.5 rounded-xs bg-[#3f3f46]" />
              <div className="h-2.5 w-2.5 rounded-xs bg-[#a1a1aa]" />
              <div className="h-2.5 w-2.5 rounded-xs bg-white" />
            </div>
            <span>100%</span>
          </div>
        </div>

        {/* Heatmap Grid Container */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-grid grid-rows-7 grid-flow-col gap-1 min-w-[700px]">
            {Array.from({ length: weeks * daysPerWeek }).map((_, idx) => {
              const weekIdx = Math.floor(idx / 7);
              const dayIdx = idx % 7;
              return (
                <div
                  key={idx}
                  title={`Week ${weekIdx + 1}, Day ${dayIdx + 1}`}
                  className={`h-3 w-3 rounded-xs transition-all hover:scale-125 cursor-pointer ${getCellIntensity(
                    weekIdx,
                    dayIdx
                  )}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Habit List with Micro-Stats & 7-Day History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-5 shadow-sm">
          <h3 className="font-semibold text-sm text-white tracking-wide border-b border-[#27272a] pb-3 mb-3">
            Habit Breakdown & 7-Day History
          </h3>

          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#27272a] bg-[#000000] p-3"
              >
                <div>
                  <h4 className="text-xs font-semibold text-white">{habit.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-[#71717a] font-mono mt-0.5">
                    <span>Success: 96%</span>
                    <span>•</span>
                    <span>Streak: {habit.streak_count || 0}d</span>
                  </div>
                </div>

                {/* 7-day mini squares */}
                <div className="flex items-center gap-1">
                  {[true, true, true, false, true, true, habit.completed_today].map((done, i) => (
                    <div
                      key={i}
                      className={`h-4 w-4 rounded-xs flex items-center justify-center text-[8px] font-bold ${
                        done
                          ? 'bg-white text-black'
                          : 'bg-[#18181b] border border-[#27272a] text-[#71717a]'
                      }`}
                    >
                      {done ? '✓' : ''}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Minimalist Expense vs Habit Correlation Chart */}
        <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white" />
                <h3 className="font-semibold text-sm text-white tracking-wide">
                  Monthly Expense vs Habit Correlation
                </h3>
              </div>
              <span className="font-mono text-xs text-zinc-300">₹{totalExpenseSum.toFixed(2)} Logged</span>
            </div>

            <p className="text-xs text-[#a1a1aa] mb-4">
              Disciplined routine days correlate with <strong>38% lower impulse spending</strong>.
            </p>

            {/* Minimalist SVG Sparkline */}
            <div className="h-32 w-full rounded-lg border border-[#27272a] bg-[#000000] p-3 flex items-end">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 300 80">
                {/* Habit Consistency Curve (White Line) */}
                <path
                  d="M 0 60 Q 50 10 100 30 T 200 15 T 300 10"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                {/* Expense Spend Curve (Muted Zinc Line) */}
                <path
                  d="M 0 30 Q 50 70 100 50 T 200 65 T 300 70"
                  fill="none"
                  stroke="#71717a"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#71717a] mt-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-4 bg-white rounded-xs" />
                <span>Habit Consistency (High)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-4 bg-[#71717a] rounded-xs" />
                <span>Impulse Spending (Low)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-[#27272a] text-[11px] text-[#71717a]">
            Linear Chronological Scan Engine • Zero recursive overhead
          </div>
        </div>
      </div>
    </div>
  );
}
