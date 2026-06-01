import { Request, Response } from 'express';
import { pronunciationService } from './pronunciation.service';
import { sendSuccess } from '../../common/utils/response';

export class PronunciationController {
  async attempt(req: Request, res: Response) {
    const result = await pronunciationService.attempt(req.user!.userId, req.body);
    sendSuccess(res, result);
  }
}

export const pronunciationController = new PronunciationController();
