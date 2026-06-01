import { Request, Response } from 'express';
import { flashcardsService } from './flashcards.service';
import { sendSuccess, sendCreated } from '../../common/utils/response';

export class FlashcardsController {
  async getDue(req: Request, res: Response) {
    const cards = await flashcardsService.getDueCards(req.user!.userId);
    sendSuccess(res, cards);
  }

  async createFromVocabulary(req: Request, res: Response) {
    const card = await flashcardsService.createFromVocabulary(
      req.user!.userId,
      req.params.vocabularyId as string,
    );
    sendCreated(res, card);
  }

  async review(req: Request, res: Response) {
    const { quality } = req.body;
    const result = await flashcardsService.review(
      req.user!.userId,
      req.params.id as string,
      quality,
    );
    sendSuccess(res, result);
  }
}

export const flashcardsController = new FlashcardsController();
