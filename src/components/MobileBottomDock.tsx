'use client';

import React from 'react';
import { Home, Calendar, Wallet, StickyNote, BarChart3, Plus } from 'lucide-react';

interface MobileBottomDockProps {
  activeTab: 'cockpit' | 'deadlines' | 'expenses' | 'notes' | 'analytics';
  onChangeTab: (tab: 'cockpit' | 'deadlines' | 'expenses' | 'notes' | 'analytics') => void;
  onOpenCapture: () => void;
}

export function MobileBottomDock({ activeTab, onChangeTab, onOpenCapture }: MobileBottomDockProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-1 pointer-events-none">
      <div className="mx-auto max-w-md rounded-2xl border border-[#27272a] bg-[#000000]/90 backdrop-blur-xl p-2 shadow-2xl flex items-center justify-around pointer-events-auto">
        {/* Home / Cockpit */}
        <button
          onClick={() => onChangeTab('cockpit')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'cockpit' ? 'text-white' : 'text-[#71717a] hover:text-[#a1a1aa]'
          }`}
        >
          <Home className="h-4 w-4" />
          <span className="text-[9px] font-mono">Home</span>
        </button>

        {/* Deadlines */}
        <button
          onClick={() => onChangeTab('deadlines')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'deadlines' ? 'text-white' : 'text-[#71717a] hover:text-[#a1a1aa]'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span className="text-[9px] font-mono">Deadlines</span>
        </button>

        {/* Elevated Center Plus Button */}
        <button
          onClick={onOpenCapture}
          className="flex h-11 w-11 -translate-y-3 items-center justify-center rounded-full bg-white text-black shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-zinc-300"
          aria-label="Quick Capture"
        >
          <Plus className="h-5 w-5 stroke-[3]" />
        </button>

        {/* Expenses */}
        <button
          onClick={() => onChangeTab('expenses')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'expenses' ? 'text-white' : 'text-[#71717a] hover:text-[#a1a1aa]'
          }`}
        >
          <Wallet className="h-4 w-4" />
          <span className="text-[9px] font-mono">Spend</span>
        </button>

        {/* Analytics Heatmap */}
        <button
          onClick={() => onChangeTab('analytics')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'text-white' : 'text-[#71717a] hover:text-[#a1a1aa]'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span className="text-[9px] font-mono">Stats</span>
        </button>
      </div>
    </div>
  );
}
