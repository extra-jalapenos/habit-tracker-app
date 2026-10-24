import { getAllCheckIns } from '@backend/storage/checkins-store';
import { CheckIn } from '@backend/storage/types';

/**
 * @zod-to-schema
 */
export type GetCheckInsReq = {
  startDate: string;
  endDate: string;
};

/**
 * @zod-to-schema
 */
export type GetCheckInsRes = {
  checkIns: CheckIn[];
};

export default function handle(ctx: CtxGet<GetCheckInsRes, GetCheckInsReq>): void {
  const startDate = ctx.request.getParameter('startDate');
  const endDate = ctx.request.getParameter('endDate');

  if (!startDate || !endDate) {
    ctx.response.status = 400;
    ctx.response.json({ checkIns: [] });
    return;
  }

  const checkIns = getAllCheckIns(startDate, endDate);
  ctx.response.json({ checkIns });
}

export type Handle = typeof handle;
