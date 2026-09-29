/**
 * OmniTrack Linear Habit Streak Algorithm
 * Complies with Workflow Spec WF-2026-OMNI:
 * - O(N) reverse chronological linear sweep over date strings
 * - Zero recursive overhead
 * - Timezone resilient
 */

export interface HabitLogEntry {
  habit_id: string;
  log_date: string; // YYYY-MM-DD
  completed: boolean;
}

export function calculateHabitStreak(
  habitLogs: { log_date: string; completed: boolean }[]
): { currentStreak: number; bestStreak: number } {
  if (!habitLogs || habitLogs.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Filter completed logs and sort descending (newest first)
  const sortedUniqueDates = Array.from(
    new Set(
      habitLogs
        .filter((l) => l.completed)
        .map((l) => l.log_date)
    )
  ).sort((a, b) => (a < b ? 1 : -1));

  if (sortedUniqueDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  // Check if active streak begins today or yesterday
  const hasLoggedToday = sortedUniqueDates[0] === today;
  const hasLoggedYesterday = sortedUniqueDates[0] === yesterday;

  if (hasLoggedToday || hasLoggedYesterday) {
    let checkDate = new Date(sortedUniqueDates[0]);

    for (let i = 0; i < sortedUniqueDates.length; i++) {
      const logDate = new Date(sortedUniqueDates[i]);
      const diffDays = Math.round(
        (checkDate.getTime() - logDate.getTime()) / (1000 * 3600 * 24)
      );

      if (i === 0 || diffDays === 1) {
        currentStreak++;
        checkDate = logDate;
      } else {
        break;
      }
    }
  }

  // Calculate best all-time streak
  for (let i = 0; i < sortedUniqueDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(sortedUniqueDates[i - 1]);
      const currDate = new Date(sortedUniqueDates[i]);
      const diff = Math.round(
        (prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24)
      );

      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(maxStreak, currentStreak),
  };
}
