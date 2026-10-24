export type Habit = {
  id: string;
  name: string;
  description: string;
  category: 'health' | 'productivity' | 'learning' | 'other';
  frequency: 'daily' | '3x-week' | 'weekly' | 'custom';
  createdDate: string;
};

export type CheckIn = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
};

export type HabitStats = {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  completedDays: number;
  completionRate: number;
};
