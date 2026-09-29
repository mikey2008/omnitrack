'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, Plus, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Task, TaskPriority } from '@/types/database';

interface TaskCardProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: () => void;
}

export function TaskCard({ tasks, onToggleTask, onAddTask }: TaskCardProps) {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'active'>('active');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'urgent') return task.priority === 'urgent' && task.status !== 'completed';
    if (filter === 'active') return task.status !== 'completed';
    return true;
  });

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="rounded border border-red-500/30 bg-red-950/40 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-red-400">
            URGENT
          </span>
        );
      case 'high':
        return (
          <span className="rounded border border-amber-500/30 bg-amber-950/40 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-amber-400">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="rounded border border-blue-500/30 bg-blue-950/40 px-1.5 py-0.5 text-[10px] font-mono text-blue-400">
            MED
          </span>
        );
      case 'low':
        return (
          <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-4 flex flex-col justify-between h-full shadow-sm hover:border-[#3f3f46] transition-all">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-white" />
            <h3 className="font-semibold text-sm text-white tracking-wide">Priorities & Tasks</h3>
            <span className="rounded-full bg-[#18181b] border border-[#27272a] px-2 py-0.2 text-[10px] font-mono text-[#a1a1aa]">
              {tasks.filter((t) => t.status !== 'completed').length} active
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex rounded-lg border border-[#27272a] bg-[#000000] p-0.5 text-[11px]">
              <button
                onClick={() => setFilter('active')}
                className={`rounded px-2 py-0.5 transition-colors cursor-pointer ${
                  filter === 'active' ? 'bg-[#27272a] text-white font-medium' : 'text-[#71717a] hover:text-zinc-300'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('urgent')}
                className={`rounded px-2 py-0.5 transition-colors cursor-pointer ${
                  filter === 'urgent' ? 'bg-[#27272a] text-red-400 font-medium' : 'text-[#71717a] hover:text-zinc-300'
                }`}
              >
                Urgent
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`rounded px-2 py-0.5 transition-colors cursor-pointer ${
                  filter === 'all' ? 'bg-[#27272a] text-white font-medium' : 'text-[#71717a] hover:text-zinc-300'
                }`}
              >
                All
              </button>
            </div>

            <button
              onClick={onAddTask}
              className="rounded-lg border border-[#27272a] bg-[#18181b] p-1.5 text-[#a1a1aa] hover:border-white hover:text-white transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#71717a]">
              No tasks found. Press Cmd+K to capture a new task.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`group flex items-start justify-between gap-3 rounded-lg border p-2.5 transition-all cursor-pointer ${
                    isCompleted
                      ? 'border-[#18181b] bg-[#000000]/60 opacity-50'
                      : 'border-[#27272a] bg-[#000000] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button className="mt-0.5 shrink-0 text-[#71717a] group-hover:text-white transition-colors">
                      {isCompleted ? (
                        <CheckSquare className="h-4 w-4 text-white" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-medium leading-snug truncate ${
                          isCompleted ? 'line-through text-[#71717a]' : 'text-zinc-100'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-[10px] text-[#71717a] font-mono mt-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {task.due_date}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">{getPriorityBadge(task.priority)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-[#27272a] text-[11px] text-[#71717a] flex items-center justify-between">
        <span>Eisenhower 4-Tier Urgency</span>
        <kbd className="text-[10px] font-mono">Press Space to toggle</kbd>
      </div>
    </div>
  );
}
