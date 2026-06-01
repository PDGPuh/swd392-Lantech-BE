import { Request, Response } from 'express';
import { languagesService } from './languages.service';
import { sendSuccess } from '../../common/utils/response';

export class LanguagesController {
  async getAll(_req: Request, res: Response) {
    const languages = await languagesService.getAll();
    sendSuccess(res, languages);
  }

  async getSource(_req: Request, res: Response) {
    const languages = await languagesService.getSourceLanguages();
    sendSuccess(res, languages);
  }

  async getTarget(_req: Request, res: Response) {
    const languages = await languagesService.getTargetLanguages();
    sendSuccess(res, languages);
  }
}

export const languagesController = new LanguagesController();
