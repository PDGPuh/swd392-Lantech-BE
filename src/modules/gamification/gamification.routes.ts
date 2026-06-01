import { Router } from 'express';
import { gamificationController } from './gamification.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authGuard } from '../../common/middlewares/auth';

const router = Router();

/**
 * @swagger
 * /gamification/me:
 *   get:
 *     tags: [Gamification]
 *     summary: Get user gamification data (XP, streak, badges)
 *     responses:
 *       200:
 *         description: Gamification data
 */
router.get('/me', authGuard, asyncHandler(gamificationController.getMe));

/**
 * @swagger
 * /gamification/badges:
 *   get:
 *     tags: [Gamification]
 *     summary: Get all badges with earned status
 *     responses:
 *       200:
 *         description: List of badges
 */
router.get('/badges', authGuard, asyncHandler(gamificationController.getBadges));

/**
 * @swagger
 * /gamification/xp-history:
 *   get:
 *     tags: [Gamification]
 *     summary: Get XP transaction history
 *     responses:
 *       200:
 *         description: XP history
 */
router.get('/xp-history', authGuard, asyncHandler(gamificationController.getXpHistory));

export default router;
