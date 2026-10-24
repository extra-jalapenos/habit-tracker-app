import { Habit } from './types';

const habits = new Map<string, Habit>();

function generateId(): string {
  return `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getAllHabits(): Habit[] {
  return Array.from(habits.values()).sort((a, b) =>
    new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );
}

export function getHabit(id: string): Habit | undefined {
  return habits.get(id);
}

export function createHabit(input: Omit<Habit, 'id' | 'createdDate'>): Habit {
  const habit: Habit = {
    ...input,
    id: generateId(),
    createdDate: new Date().toISOString(),
  };
  habits.set(habit.id, habit);
  return habit;
}

export function updateHabit(id: string, input: Partial<Omit<Habit, 'id' | 'createdDate'>>): Habit | undefined {
  const habit = habits.get(id);
  if (!habit) return undefined;

  const updated = { ...habit, ...input };
  habits.set(id, updated);
  return updated;
}

export function deleteHabit(id: string): boolean {
  return habits.delete(id);
}
