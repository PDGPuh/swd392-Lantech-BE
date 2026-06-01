import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '../../common/utils/response';

export class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    sendCreated(res, result);
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    sendSuccess(res, result);
  }

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken, req.user!.userId);
    sendSuccess(res, { message: 'Logged out successfully' });
  }

  async getMe(req: Request, res: Response) {
    const user = await authService.getMe(req.user!.userId);
    sendSuccess(res, user);
  }
}

export const authController = new AuthController();
