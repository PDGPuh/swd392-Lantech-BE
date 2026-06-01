import { Router } from 'express';
import { exercisesController } from './exercises.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { validate } from '../../common/middlewares/validate';
import { authGuard } from '../../common/middlewares/auth';
import { submitAnswerSchema } from './exercises.validation';

const router = Router();

/**
 * @swagger
 * /exercises/lesson/{lessonId}:
 *   get:
 *     tags: [Exercises]
 *     summary: Get exercises for a lesson
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of exercises
 */
router.get('/lesson/:lessonId', authGuard, asyncHandler(exercisesController.getByLesson));

/**
 * @swagger
 * /exercises/{id}/submit:
 *   post:
 *     tags: [Exercises]
 *     summary: Submit exercise answer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answer]
 *             properties:
 *               answer: { type: string }
 *     responses:
 *       200:
 *         description: Exercise result
 */
router.post(
  '/:id/submit',
  authGuard,
  validate({ body: submitAnswerSchema }),
  asyncHandler(exercisesController.submit),
);

export default router;
