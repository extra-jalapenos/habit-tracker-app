import { CheckIn } from './types';

const checkIns = new Map<string, CheckIn>();

function generateId(): string {
  return `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getCheckInKey(habitId: string, date: string): string {
  return `${habitId}:${date}`;
}

export function getCheckIn(habitId: string, date: string): CheckIn | undefined {
  return checkIns.get(getCheckInKey(habitId, date));
}

export function getCheckInsByHabit(habitId: string, startDate: string, endDate: string): CheckIn[] {
  return Array.from(checkIns.values())
    .filter(ci => ci.habitId === habitId && ci.date >= startDate && ci.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getAllCheckIns(startDate: string, endDate: string): CheckIn[] {
  return Array.from(checkIns.values())
    .filter(ci => ci.date >= startDate && ci.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function logCheckIn(habitId: string, date: string, completed: boolean): CheckIn {
  const key = getCheckInKey(habitId, date);
  const existing = checkIns.get(key);

  if (existing) {
    existing.completed = completed;
    return existing;
  }

  const checkIn: CheckIn = {
    id: generateId(),
    habitId,
    date,
    completed,
  };
  checkIns.set(key, checkIn);
  return checkIn;
}

export function deleteCheckInsByHabit(habitId: string): number {
  let deleted = 0;
  for (const [key, checkIn] of checkIns.entries()) {
    if (checkIn.habitId === habitId) {
      checkIns.delete(key);
      deleted++;
    }
  }
  return deleted;
}
