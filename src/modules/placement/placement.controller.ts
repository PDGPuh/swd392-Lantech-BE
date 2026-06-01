import { Request, Response } from 'express';
import { placementService } from './placement.service';
import { sendSuccess } from '../../common/utils/response';

export class PlacementController {
  async getQuestions(req: Request, res: Response) {
    const { sourceLanguageCode } = req.query as { sourceLanguageCode?: string };
    const questions = await placementService.getQuestions(sourceLanguageCode);
    sendSuccess(res, questions);
  }

  async submit(req: Request, res: Response) {
    const result = await placementService.submit(req.user!.userId, req.body.answers);
    sendSuccess(res, result);
  }
}

export const placementController = new PlacementController();
