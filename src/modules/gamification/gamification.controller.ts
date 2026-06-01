import { Request, Response } from 'express';
import { gamificationService } from './gamification.service';
import { sendSuccess } from '../../common/utils/response';

export class GamificationController {
  async getMe(req: Request, res: Response) {
    const data = await gamificationService.getMyGamification(req.user!.userId);
    sendSuccess(res, data);
  }

  async getBadges(req: Request, res: Response) {
    const badges = await gamificationService.getAllBadges(req.user!.userId);
    sendSuccess(res, badges);
  }

  async getXpHistory(req: Request, res: Response) {
    const history = await gamificationService.getXpHistory(req.user!.userId);
    sendSuccess(res, history);
  }
}

export const gamificationController = new GamificationController();
