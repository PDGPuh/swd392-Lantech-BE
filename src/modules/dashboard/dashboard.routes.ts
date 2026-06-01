import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authGuard } from '../../common/middlewares/auth';

const router = Router();

/**
 * @swagger
 * /dashboard/me:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get user learning dashboard
 *     responses:
 *       200:
 *         description: Dashboard data with stats, progress, recommendations
 */
router.get('/me', authGuard, asyncHandler(dashboardController.getMe));

export default router;
