import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../common/utils/response';

export class DashboardController {
  async getMe(req: Request, res: Response) {
    const data = await dashboardService.getMyDashboard(req.user!.userId);
    sendSuccess(res, data);
  }
}

export const dashboardController = new DashboardController();
