import { Request, Response } from 'express';
import { usersService } from './users.service';
import { sendSuccess } from '../../common/utils/response';

export class UsersController {
  async getMe(req: Request, res: Response) {
    const user = await usersService.getProfile(req.user!.userId);
    sendSuccess(res, user);
  }

  async updateMe(req: Request, res: Response) {
    const user = await usersService.updateProfile(req.user!.userId, req.body);
    sendSuccess(res, user);
  }

  async updateSourceLanguage(req: Request, res: Response) {
    const user = await usersService.updateSourceLanguage(
      req.user!.userId,
      req.body.sourceLanguageCode,
    );
    sendSuccess(res, user);
  }

  async updateTargetLevel(req: Request, res: Response) {
    const user = await usersService.updateTargetLevel(req.user!.userId, req.body.currentCefrLevel);
    sendSuccess(res, user);
  }
}

export const usersController = new UsersController();
