import { Request, Response } from 'express';
import { vocabularyService } from './vocabulary.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/utils/response';

export class VocabularyController {
  async findAll(req: Request, res: Response) {
    const { level, sourceLanguageCode } = req.query as Record<string, string>;
    const vocabularies = await vocabularyService.findAll({ level, sourceLanguageCode });
    sendSuccess(res, vocabularies);
  }

  async findById(req: Request, res: Response) {
    const vocabulary = await vocabularyService.findById(req.params.id as string);
    sendSuccess(res, vocabulary);
  }

  async create(req: Request, res: Response) {
    const vocabulary = await vocabularyService.create(req.body);
    sendCreated(res, vocabulary);
  }

  async update(req: Request, res: Response) {
    const vocabulary = await vocabularyService.update(req.params.id as string, req.body);
    sendSuccess(res, vocabulary);
  }

  async delete(req: Request, res: Response) {
    await vocabularyService.delete(req.params.id as string);
    sendNoContent(res);
  }
}

export const vocabularyController = new VocabularyController();
