import { deleteHabit } from '@backend/storage/habits-store';
import { deleteCheckInsByHabit } from '@backend/storage/checkins-store';

/**
 * @zod-to-schema
 */
export type DeleteHabitReq = {
  id: string;
};

/**
 * @zod-to-schema
 */
export type DeleteHabitRes = {
  success: boolean;
};

export default function handle(ctx: CtxDelete<DeleteHabitReq, DeleteHabitRes>): void {
  const id = ctx.request.getParameter('id');

  const deleted = deleteHabit(id);

  if (deleted) {
    deleteCheckInsByHabit(id);
    ctx.response.json({ success: true }, 200);
  } else {
    ctx.response.status = 404;
    ctx.response.json({ success: false });
  }
}

export type Handle = typeof handle;
