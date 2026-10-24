import { createHabit } from '@backend/storage/habits-store';
import { Habit } from '@backend/storage/types';

/**
 * @zod-to-schema
 */
export type CreateHabitReq = {
  name: string;
  description: string;
  category: 'health' | 'productivity' | 'learning' | 'other';
  frequency: 'daily' | '3x-week' | 'weekly' | 'custom';
};

/**
 * @zod-to-schema
 */
export type CreateHabitRes = {
  habit: Habit;
};

export default function handle(ctx: CtxPost<CreateHabitReq, CreateHabitRes>): void {
  const body = ctx.request.json();

  const habit = createHabit({
    name: body.name,
    description: body.description,
    category: body.category,
    frequency: body.frequency,
  });

  ctx.response.json({ habit }, 201);
}

export type Handle = typeof handle;
