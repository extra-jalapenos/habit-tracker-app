import { getCheckInsByHabit } from '@backend/storage/checkins-store';
import { calculateStats } from '@backend/utils/habit-stats';
import { HabitStats } from '@backend/storage/types';

/**
 * @zod-to-schema
 */
export type GetHabitStatsReq = {
  habitId: string;
  days?: string;
};

/**
 * @zod-to-schema
 */
export type GetHabitStatsRes = {
  stats: HabitStats;
};

export default function handle(ctx: CtxGet<GetHabitStatsRes, GetHabitStatsReq>): void {
  const habitId = ctx.request.getParameter('habitId');
  const daysParam = ctx.request.getParameter('days');
  const days = daysParam ? parseInt(daysParam, 10) : 30;

  if (!habitId) {
    ctx.response.status = 400;
    ctx.response.json({
      stats: {
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        completedDays: 0,
        completionRate: 0,
      },
    });
    return;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const startDate = cutoffDate.toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  const checkIns = getCheckInsByHabit(habitId, startDate, endDate);
  const stats = calculateStats(checkIns, days);

  ctx.response.json({ stats });
}

export type Handle = typeof handle;
