import { Router } from 'express';
import { learningPathsController } from './learning-paths.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authGuard } from '../../common/middlewares/auth';

const router = Router();

/**
 * @swagger
 * /learning-paths/me:
 *   get:
 *     tags: [Learning Paths]
 *     summary: Get current user's active learning path
 *     responses:
 *       200:
 *         description: Active learning path with lessons
 */
router.get('/me', authGuard, asyncHandler(learningPathsController.getMyPath));

/**
 * @swagger
 * /learning-paths/generate:
 *   post:
 *     tags: [Learning Paths]
 *     summary: Generate a new learning path
 *     responses:
 *       201:
 *         description: New learning path generated
 */
router.post('/generate', authGuard, asyncHandler(learningPathsController.generate));

export default router;
