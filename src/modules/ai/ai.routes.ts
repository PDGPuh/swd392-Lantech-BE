import { Router } from 'express';
import { aiController } from './ai.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { validate } from '../../common/middlewares/validate';
import { authGuard } from '../../common/middlewares/auth';
import {
  generateExplanationSchema,
  generateExercisesSchema,
  chatTutorSchema,
} from './ai.validation';

const router = Router();

/**
 * @swagger
 * /ai/generate-explanation:
 *   post:
 *     tags: [AI]
 *     summary: Generate explanation for a concept
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [concept]
 *             properties:
 *               concept: { type: string }
 *               sourceLanguageCode: { type: string }
 *     responses:
 *       200:
 *         description: AI-generated explanation
 */
router.post(
  '/generate-explanation',
  authGuard,
  validate({ body: generateExplanationSchema }),
  asyncHandler(aiController.generateExplanation),
);

/**
 * @swagger
 * /ai/generate-exercises:
 *   post:
 *     tags: [AI]
 *     summary: Generate exercises for a topic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [topic]
 *             properties:
 *               topic: { type: string }
 *               count: { type: integer, default: 3 }
 *               sourceLanguageCode: { type: string }
 *     responses:
 *       200:
 *         description: AI-generated exercises
 */
router.post(
  '/generate-exercises',
  authGuard,
  validate({ body: generateExercisesSchema }),
  asyncHandler(aiController.generateExercises),
);

/**
 * @swagger
 * /ai/analyze-weaknesses:
 *   post:
 *     tags: [AI]
 *     summary: Analyze user weaknesses from recent mistakes
 *     responses:
 *       200:
 *         description: Weakness analysis
 */
router.post('/analyze-weaknesses', authGuard, asyncHandler(aiController.analyzeWeaknesses));

/**
 * @swagger
 * /ai/chat-tutor:
 *   post:
 *     tags: [AI]
 *     summary: Chat with AI tutor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *               conversationHistory: { type: array, items: { type: object } }
 *     responses:
 *       200:
 *         description: AI tutor response
 */
router.post(
  '/chat-tutor',
  authGuard,
  validate({ body: chatTutorSchema }),
  asyncHandler(aiController.chatTutor),
);

export default router;
