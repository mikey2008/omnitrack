'use client';

import React from 'react';
import { IndianRupee, TrendingUp, Wallet, ArrowUpRight, Plus } from 'lucide-react';
import { Expense } from '@/types/database';

interface ExpenseCardProps {
  expenses: Expense[];
  onAddExpense: () => void;
  dailyBudget?: number;
}

export function ExpenseCard({ expenses, onAddExpense, dailyBudget = 1000 }: ExpenseCardProps) {
  const todayTotal = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const budgetPercent = Math.min(Math.round((todayTotal / dailyBudget) * 100), 100);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food':
        return 'text-orange-400 border-orange-500/30 bg-orange-950/20';
      case 'transport':
        return 'text-sky-400 border-sky-500/30 bg-sky-950/20';
      case 'tech':
        return 'text-purple-400 border-purple-500/30 bg-purple-950/20';
      case 'bills':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
      case 'leisure':
        return 'text-pink-400 border-pink-500/30 bg-pink-950/20';
      default:
        return 'text-zinc-400 border-zinc-700 bg-zinc-900';
    }
  };

  return (
    <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-4 flex flex-col justify-between h-full shadow-sm hover:border-[#3f3f46] transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-white" />
            <h3 className="font-semibold text-sm text-white tracking-wide">Expense & Cash Flow</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-white">₹{todayTotal.toFixed(2)}</span>
            <button
              onClick={onAddExpense}
              className="rounded-lg border border-[#27272a] bg-[#18181b] p-1.5 text-[#a1a1aa] hover:border-white hover:text-white transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Daily Budget Progress */}
        <div className="mb-3 rounded-lg border border-[#27272a] bg-[#000000] p-2.5">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-[#71717a]">Daily Budget Utilization</span>
            <span className="font-mono text-zinc-300">
              ₹{todayTotal.toFixed(0)} / ₹{dailyBudget} ({budgetPercent}%)
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#18181b] overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                budgetPercent > 90 ? 'bg-red-500' : budgetPercent > 70 ? 'bg-amber-400' : 'bg-white'
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>

        {/* Micro-Stream Transactions */}
        <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-[#27272a] bg-[#000000] p-2 hover:border-[#3f3f46] transition-all"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] uppercase font-mono font-semibold shrink-0 ${getCategoryColor(
                    expense.category
                  )}`}
                >
                  {expense.category}
                </span>
                <span className="text-xs text-zinc-200 truncate">{expense.note || expense.category}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="rounded bg-[#18181b] px-1.5 py-0.5 text-[9px] uppercase font-mono text-[#71717a]">
                  {expense.payment_method}
                </span>
                <span className="font-mono text-xs font-semibold text-white">
                  -₹{expense.amount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[#27272a] text-[11px] text-[#71717a] flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Wallet className="h-3 w-3" />
          <span>UPI / Cash Micro-Log</span>
        </span>
        <span className="font-mono text-[10px] text-zinc-400">numeric(10,2)</span>
      </div>
    </div>
  );
}
