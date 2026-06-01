import { Request, Response } from 'express';
import { learningPathsService } from './learning-paths.service';
import { sendSuccess, sendCreated } from '../../common/utils/response';

export class LearningPathsController {
  async getMyPath(req: Request, res: Response) {
    const result = await learningPathsService.getMyPath(req.user!.userId);
    sendSuccess(res, result);
  }

  async generate(req: Request, res: Response) {
    const path = await learningPathsService.generate(req.user!.userId);
    sendCreated(res, path);
  }
}

export const learningPathsController = new LearningPathsController();
