import { getHabit } from '@backend/storage/habits-store';
import { Habit } from '@backend/storage/types';

/**
 * @zod-to-schema
 */
export type GetHabitReq = {
  id: string;
};

/**
 * @zod-to-schema
 */
export type GetHabitRes = {
  habit: Habit | null;
};

export default function handle(ctx: CtxGet<GetHabitRes, GetHabitReq>): void {
  const id = ctx.request.getParameter('id');
  const habit = getHabit(id);

  if (!habit) {
    ctx.response.status = 404;
    ctx.response.json({ habit: null });
    return;
  }

  ctx.response.json({ habit });
}

export type Handle = typeof handle;
