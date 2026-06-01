import { Router } from 'express';
import { leaderboardController } from './leaderboard.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authGuard } from '../../common/middlewares/auth';

const router = Router();

/**
 * @swagger
 * /leaderboard/weekly:
 *   get:
 *     tags: [Leaderboard]
 *     summary: Get weekly leaderboard
 *     responses:
 *       200:
 *         description: Weekly rankings
 */
router.get('/weekly', authGuard, asyncHandler(leaderboardController.getWeekly));

/**
 * @swagger
 * /leaderboard/monthly:
 *   get:
 *     tags: [Leaderboard]
 *     summary: Get monthly leaderboard
 *     responses:
 *       200:
 *         description: Monthly rankings
 */
router.get('/monthly', authGuard, asyncHandler(leaderboardController.getMonthly));

/**
 * @swagger
 * /leaderboard/all-time:
 *   get:
 *     tags: [Leaderboard]
 *     summary: Get all-time leaderboard
 *     responses:
 *       200:
 *         description: All-time rankings
 */
router.get('/all-time', authGuard, asyncHandler(leaderboardController.getAllTime));

export default router;
