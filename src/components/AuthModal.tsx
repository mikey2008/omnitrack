'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, ShieldCheck, Sparkles, User, Check, Flame, Crown } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { operatorName, setOperatorName, isMasterMode } = useAuth();
  const [customName, setCustomName] = useState(operatorName);

  const animePersonas = [
    'Shadow Monarch',
    'Gojo Satoru (Limitless)',
    'Levi Ackerman',
    'Okabe Rintaro (Steins;Gate)',
    'The Dark Knight',
    'Cooper (Interstellar)',
  ];

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim()) {
      setOperatorName(customName.trim());
    }
    onClose();
  };

  const handleSelectPersona = (name: string) => {
    setCustomName(name);
    setOperatorName(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl border border-[#27272a] bg-[#09090c] p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-500 text-black font-black text-xs">
              <Crown className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Master Operator Profile
              </h3>
              <p className="text-[11px] text-[#71717a]">Zero-Password Permanent Access</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#71717a] hover:bg-[#18181b] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Master Access Status Badge */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-xs font-semibold text-white">Direct Master Access Active</p>
              <p className="text-[10px] text-emerald-400">No login or password needed on this device</p>
            </div>
          </div>
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
        </div>

        {/* Custom Persona Picker */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#a1a1aa] mb-1.5">
              Operator Persona / Handle
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Shadow Monarch, Gojo Satoru..."
              className="w-full rounded-xl border border-[#27272a] bg-[#000000] px-3.5 py-2.5 text-xs text-white placeholder:text-[#71717a] focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <p className="text-[11px] font-mono uppercase text-[#71717a] mb-2">
              Quick Select Persona:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {animePersonas.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSelectPersona(p)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] transition-all cursor-pointer ${
                    customName === p
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-medium'
                      : 'border-[#1f1f24] bg-[#000000] text-[#a1a1aa] hover:border-zinc-500 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#1c1c21] flex items-center justify-between">
            <span className="text-[10px] text-[#71717a]">Saved locally</span>
            <button
              type="submit"
              className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-200 transition-all cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
