import { Request, Response } from 'express';
import { leaderboardService } from './leaderboard.service';
import { sendSuccess } from '../../common/utils/response';

export class LeaderboardController {
  async getWeekly(_req: Request, res: Response) {
    const data = await leaderboardService.getWeekly();
    sendSuccess(res, data);
  }

  async getMonthly(_req: Request, res: Response) {
    const data = await leaderboardService.getMonthly();
    sendSuccess(res, data);
  }

  async getAllTime(_req: Request, res: Response) {
    const data = await leaderboardService.getAllTime();
    sendSuccess(res, data);
  }
}

export const leaderboardController = new LeaderboardController();
