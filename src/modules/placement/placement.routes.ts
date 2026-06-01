import { Router } from 'express';
import { placementController } from './placement.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { validate } from '../../common/middlewares/validate';
import { authGuard } from '../../common/middlewares/auth';
import { submitPlacementSchema } from './placement.validation';

const router = Router();

/**
 * @swagger
 * /placement/questions:
 *   get:
 *     tags: [Placement]
 *     summary: Get placement test questions
 *     parameters:
 *       - in: query
 *         name: sourceLanguageCode
 *         schema: { type: string }
 *         description: Filter by source language
 *     responses:
 *       200:
 *         description: Placement questions
 */
router.get('/questions', authGuard, asyncHandler(placementController.getQuestions));

/**
 * @swagger
 * /placement/submit:
 *   post:
 *     tags: [Placement]
 *     summary: Submit placement test answers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId: { type: string }
 *                     answer: { type: string }
 *     responses:
 *       200:
 *         description: Placement result with CEFR level
 */
router.post(
  '/submit',
  authGuard,
  validate({ body: submitPlacementSchema }),
  asyncHandler(placementController.submit),
);

export default router;
