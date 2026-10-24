import { getAllHabits } from '@backend/storage/habits-store';
import { Habit } from '@backend/storage/types';

/**
 * @zod-to-schema
 */
export type HabitsListRes = {
  habits: Habit[];
};

export default function handle(ctx: CtxGet<HabitsListRes>): void {
  const habits = getAllHabits();
  ctx.response.json({ habits });
}

export type Handle = typeof handle;
