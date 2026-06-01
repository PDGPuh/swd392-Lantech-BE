import { Request, Response } from 'express';
import { exercisesService } from './exercises.service';
import { sendSuccess } from '../../common/utils/response';

export class ExercisesController {
  async getByLesson(req: Request, res: Response) {
    const exercises = await exercisesService.getByLesson(req.params.lessonId as string);
    sendSuccess(res, exercises);
  }

  async submit(req: Request, res: Response) {
    const result = await exercisesService.submit(
      req.user!.userId,
      req.params.id as string,
      req.body.answer,
    );
    sendSuccess(res, result);
  }
}

export const exercisesController = new ExercisesController();
