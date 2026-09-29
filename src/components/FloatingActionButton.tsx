'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-bold text-black shadow-2xl hover:bg-zinc-200 transition-all cursor-pointer hover:scale-105 active:scale-95 border border-zinc-300"
      aria-label="Capture"
    >
      <Plus className="h-4 w-4 stroke-[3]" />
      <span className="tracking-wide">Capture</span>
      <kbd className="hidden sm:inline-block rounded bg-black/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold">
        ⌘K
      </kbd>
    </button>
  );
}
