import { Request, Response } from 'express';
import { lessonsService } from './lessons.service';
import { sendSuccess } from '../../common/utils/response';

export class LessonsController {
  async findAll(req: Request, res: Response) {
    const filters = {
      level: req.query.level as string | undefined,
      skill: req.query.skill as string | undefined,
      sourceLanguageCode: req.query.sourceLanguageCode as string | undefined,
    };
    const lessons = await lessonsService.findAll(filters);
    sendSuccess(res, lessons);
  }

  async findById(req: Request, res: Response) {
    const userId = req.user?.userId;
    const lesson = await lessonsService.findById(req.params.id as string, userId);
    sendSuccess(res, lesson);
  }

  async start(req: Request, res: Response) {
    const progress = await lessonsService.startLesson(req.user!.userId, req.params.id as string);
    sendSuccess(res, progress);
  }

  async complete(req: Request, res: Response) {
    const result = await lessonsService.completeLesson(req.user!.userId, req.params.id as string);
    sendSuccess(res, result);
  }
}

export const lessonsController = new LessonsController();
