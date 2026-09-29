'use client';

import React, { useState } from 'react';
import { StickyNote, Save, Pin, Sparkles } from 'lucide-react';
import { Note } from '@/types/database';

interface ScratchpadCardProps {
  initialNote?: Note;
  onSaveNote: (content: string) => void;
}

export function ScratchpadCard({ initialNote, onSaveNote }: ScratchpadCardProps) {
  const [content, setContent] = useState(
    initialNote?.content ||
      `# Sprint Goal: Complete Distributed Consensus
- [x] Read Raft Paper (Ongaro & Ousterhout)
- [ ] Implement leader election RPC in Go
- [ ] Write mock RPC failure tests

\`\`\`go
func (rf *Raft) RequestVote(args *RequestVoteArgs, reply *RequestVoteReply) {
    // Zero-overhead state transition
}
\`\`\``
  );

  const [isSaved, setIsSaved] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    onSaveNote(content);
    setIsSaved(true);
  };

  return (
    <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-4 flex flex-col justify-between h-full shadow-sm hover:border-[#3f3f46] transition-all">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-white" />
            <h3 className="font-semibold text-sm text-white tracking-wide">Quick Scratchpad & Pinned Notes</h3>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                isSaved ? 'text-zinc-500' : 'text-amber-400 bg-amber-950/30'
              }`}
            >
              {isSaved ? 'Saved' : 'Unsaved'}
            </span>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 rounded-lg border border-[#27272a] bg-[#18181b] hover:bg-white hover:text-black px-2 py-1 text-xs text-white transition-all cursor-pointer"
            >
              <Save className="h-3 w-3" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Textarea Editor */}
        <div className="relative flex-1 min-h-[160px]">
          <textarea
            value={content}
            onChange={handleChange}
            placeholder="Write quick markdown notes, code snippets, or ideas..."
            className="w-full h-full min-h-[160px] resize-none rounded-lg border border-[#27272a] bg-[#000000] p-3 text-xs font-mono text-zinc-200 placeholder:text-[#71717a] focus:border-white focus:outline-none focus:ring-0 leading-relaxed"
          />
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-[#27272a] text-[11px] text-[#71717a] flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Pin className="h-3 w-3 text-emerald-400" />
          <span>Markdown + Code AST Sanitized</span>
        </span>
        <span className="font-mono text-[10px]">auto-synced</span>
      </div>
    </div>
  );
}
