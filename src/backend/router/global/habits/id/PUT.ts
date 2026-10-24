import { updateHabit } from '@backend/storage/habits-store';
import { Habit } from '@backend/storage/types';

/**
 * @zod-to-schema
 */
export type UpdateHabitReq = {
  id: string;
  name?: string;
  description?: string;
  category?: 'health' | 'productivity' | 'learning' | 'other';
  frequency?: 'daily' | '3x-week' | 'weekly' | 'custom';
};

/**
 * @zod-to-schema
 */
export type UpdateHabitRes = {
  habit: Habit | null;
};

export default function handle(ctx: CtxPut<UpdateHabitReq, UpdateHabitRes>): void {
  const body = ctx.request.json();
  const { id, ...updates } = body;

  const habit = updateHabit(id, updates);

  if (!habit) {
    ctx.response.status = 404;
    ctx.response.json({ habit: null });
    return;
  }

  ctx.response.json({ habit });
}

export type Handle = typeof handle;
