import { logCheckIn } from '@backend/storage/checkins-store';
import { CheckIn } from '@backend/storage/types';

/**
 * @zod-to-schema
 */
export type LogCheckInReq = {
  habitId: string;
  date: string;
  completed: boolean;
};

/**
 * @zod-to-schema
 */
export type LogCheckInRes = {
  checkIn: CheckIn;
};

export default function handle(ctx: CtxPost<LogCheckInReq, LogCheckInRes>): void {
  const body = ctx.request.json();

  if (!body.habitId || !body.date) {
    ctx.response.status = 400;
    ctx.response.json({ checkIn: {} as CheckIn });
    return;
  }

  const checkIn = logCheckIn(body.habitId, body.date, body.completed ?? true);
  ctx.response.json({ checkIn }, 201);
}

export type Handle = typeof handle;
