'use client';

import React from 'react';
import { GraduationCap, AlertTriangle, Clock, ExternalLink, Plus } from 'lucide-react';
import { Academic } from '@/types/database';

interface AcademicCardProps {
  academics: Academic[];
  onAddAcademic: () => void;
}

export function AcademicCard({ academics, onAddAcademic }: AcademicCardProps) {
  const getUrgencySignal = (deadlineStr: string) => {
    // Simple mock urgency logic
    if (deadlineStr.toLowerCase().includes('tonight') || deadlineStr.toLowerCase().includes('today') || deadlineStr.toLowerCase().includes('24h')) {
      return {
        badge: 'text-red-400 border-red-500/30 bg-red-950/40',
        pulse: true,
        text: 'CRITICAL',
      };
    }
    if (deadlineStr.toLowerCase().includes('tomorrow') || deadlineStr.toLowerCase().includes('2 days')) {
      return {
        badge: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
        pulse: false,
        text: 'UPCOMING',
      };
    }
    return {
      badge: 'text-zinc-400 border-zinc-700 bg-zinc-900',
      pulse: false,
      text: 'SCHEDULED',
    };
  };

  return (
    <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-4 flex flex-col justify-between h-full shadow-sm hover:border-[#3f3f46] transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-white" />
            <h3 className="font-semibold text-sm text-white tracking-wide">Academic Sprints & Deadlines</h3>
          </div>

          <button
            onClick={onAddAcademic}
            className="rounded-lg border border-[#27272a] bg-[#18181b] p-1.5 text-[#a1a1aa] hover:border-white hover:text-white transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Deliverables List */}
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {academics.map((item) => {
            const urgency = getUrgencySignal(item.deadline);
            return (
              <div
                key={item.id}
                className="group flex flex-col gap-1.5 rounded-lg border border-[#27272a] bg-[#000000] p-2.5 hover:border-[#3f3f46] transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="rounded bg-[#18181b] border border-[#27272a] px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 shrink-0">
                      {item.course_name}
                    </span>
                    <h4 className="text-xs font-medium text-white truncate">{item.title}</h4>
                  </div>

                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-mono font-semibold shrink-0 ${urgency.badge} ${
                      urgency.pulse ? 'pulse-urgent' : ''
                    }`}
                  >
                    {urgency.text}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#71717a]">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.deadline}</span>
                  </div>

                  {item.syllabus_url && (
                    <a
                      href={item.syllabus_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-0.5 text-[#a1a1aa] hover:text-white transition-colors"
                    >
                      <span className="text-[10px]">Syllabus</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-[#27272a] text-[11px] text-[#71717a] flex items-center justify-between">
        <span className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-amber-400" />
          <span>&lt;48h horizon auto-escalation</span>
        </span>
        <span className="font-mono text-[10px]">3 Deliverables</span>
      </div>
    </div>
  );
}
