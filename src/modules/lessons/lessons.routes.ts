import { Router } from 'express';
import { lessonsController } from './lessons.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authGuard, optionalAuth } from '../../common/middlewares/auth';

const router = Router();

/**
 * @swagger
 * /lessons:
 *   get:
 *     tags: [Lessons]
 *     summary: Get lessons with filters
 *     parameters:
 *       - in: query
 *         name: level
 *         schema: { type: string, enum: [A1, A2, B1, B2, C1] }
 *       - in: query
 *         name: skill
 *         schema: { type: string, enum: [LISTENING, SPEAKING, READING, WRITING, GRAMMAR, VOCABULARY] }
 *       - in: query
 *         name: sourceLanguageCode
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of lessons
 */
router.get('/', optionalAuth, asyncHandler(lessonsController.findAll));

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     tags: [Lessons]
 *     summary: Get lesson by ID with exercises
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lesson detail
 */
router.get('/:id', optionalAuth, asyncHandler(lessonsController.findById));

/**
 * @swagger
 * /lessons/{id}/start:
 *   post:
 *     tags: [Lessons]
 *     summary: Start a lesson
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lesson progress started
 */
router.post('/:id/start', authGuard, asyncHandler(lessonsController.start));

/**
 * @swagger
 * /lessons/{id}/complete:
 *   post:
 *     tags: [Lessons]
 *     summary: Complete a lesson
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lesson completed with XP awarded
 */
router.post('/:id/complete', authGuard, asyncHandler(lessonsController.complete));

export default router;
