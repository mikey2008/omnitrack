'use client';

import React from 'react';
import { Check, Flame, Plus } from 'lucide-react';
import { Habit } from '@/types/database';

interface HabitStripProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: () => void;
}

export function HabitStrip({ habits, onToggleHabit, onAddHabit }: HabitStripProps) {
  return (
    <div className="w-full border-b border-[#27272a] bg-[#000000] py-3 px-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#71717a] shrink-0 pr-2">
          <span>Habits</span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {habits.map((habit) => {
            const isDone = habit.completed_today;
            return (
              <button
                key={habit.id}
                onClick={() => onToggleHabit(habit.id)}
                className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all cursor-pointer ${
                  isDone
                    ? 'border-white bg-white text-black font-semibold shadow-sm'
                    : 'border-[#27272a] bg-[#09090b] text-[#e4e4e7] hover:border-[#3f3f46] hover:bg-[#121215]'
                }`}
              >
                {/* Circular checkbox indicator */}
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all ${
                    isDone
                      ? 'bg-black text-white'
                      : 'border border-[#3f3f46] bg-transparent group-hover:border-white'
                  }`}
                >
                  {isDone && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                </div>

                <span>{habit.title}</span>

                {/* Streak Counter Badge */}
                {(habit.streak_count || 0) > 0 && (
                  <div
                    className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isDone
                        ? 'bg-zinc-200 text-zinc-900'
                        : 'bg-[#18181b] text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    <Flame className="h-2.5 w-2.5 fill-current" />
                    <span>{habit.streak_count}d</span>
                  </div>
                )}
              </button>
            );
          })}

          {/* Quick Add Habit Button */}
          <button
            onClick={onAddHabit}
            className="flex items-center gap-1 rounded-full border border-dashed border-[#3f3f46] bg-transparent px-2.5 py-1.5 text-xs text-[#71717a] hover:border-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
