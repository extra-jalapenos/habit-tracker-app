import { CheckIn, HabitStats } from '../storage/types';

export function calculateStreak(checkIns: CheckIn[]): { currentStreak: number; longestStreak: number } {
  if (checkIns.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const sortedCheckIns = [...checkIns].sort((a, b) => a.date.localeCompare(b.date));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let expectedDate = new Date(today);

  for (let i = sortedCheckIns.length - 1; i >= 0; i--) {
    const checkIn = sortedCheckIns[i];
    const checkInDate = new Date(checkIn.date);
    checkInDate.setHours(0, 0, 0, 0);

    if (checkIn.completed) {
      if (i === sortedCheckIns.length - 1 ||
          (expectedDate.getTime() - checkInDate.getTime()) === 86400000) {
        currentStreak++;
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }

    expectedDate = checkInDate;
  }

  // Verify if currentStreak should continue (check if yesterday/today is completed)
  if (currentStreak > 0) {
    const lastCheckIn = sortedCheckIns[sortedCheckIns.length - 1];
    const lastCheckInDate = new Date(lastCheckIn.date);
    lastCheckInDate.setHours(0, 0, 0, 0);

    const daysDiff = (today.getTime() - lastCheckInDate.getTime()) / 86400000;
    if (daysDiff > 1) {
      currentStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
}

export function calculateCompletionRate(checkIns: CheckIn[], days: number = 30): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);

  const recentCheckIns = checkIns.filter(ci => new Date(ci.date) >= cutoffDate);

  if (recentCheckIns.length === 0) return 0;

  const completed = recentCheckIns.filter(ci => ci.completed).length;
  return Math.round((completed / recentCheckIns.length) * 100);
}

export function getChartData(checkIns: CheckIn[], days: number = 30): Array<{ date: string; completed: boolean }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);

  const data: Array<{ date: string; completed: boolean }> = [];
  const checkInMap = new Map(checkIns.map(ci => [ci.date, ci.completed]));

  for (let i = 0; i < days; i++) {
    const date = new Date(cutoffDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    data.push({
      date: dateStr,
      completed: checkInMap.get(dateStr) ?? false,
    });
  }

  return data;
}

export function calculateStats(checkIns: CheckIn[], days: number = 30): HabitStats {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);

  const recentCheckIns = checkIns.filter(ci => new Date(ci.date) >= cutoffDate);
  const completedDays = recentCheckIns.filter(ci => ci.completed).length;

  const { currentStreak, longestStreak } = calculateStreak(checkIns);
  const completionRate = calculateCompletionRate(checkIns, days);

  return {
    currentStreak,
    longestStreak,
    totalDays: recentCheckIns.length,
    completedDays,
    completionRate,
  };
}
