import { Router } from 'express';
import { pronunciationController } from './pronunciation.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { validate } from '../../common/middlewares/validate';
import { authGuard } from '../../common/middlewares/auth';
import { pronunciationAttemptSchema } from './pronunciation.validation';

const router = Router();

/**
 * @swagger
 * /pronunciation/attempt:
 *   post:
 *     tags: [Pronunciation]
 *     summary: Submit pronunciation attempt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetText, transcriptText]
 *             properties:
 *               exerciseId: { type: string }
 *               targetText: { type: string, example: "I would like a cup of coffee." }
 *               transcriptText: { type: string, example: "I would like a cup of coffee" }
 *     responses:
 *       200:
 *         description: Pronunciation result with score and feedback
 */
router.post(
  '/attempt',
  authGuard,
  validate({ body: pronunciationAttemptSchema }),
  asyncHandler(pronunciationController.attempt),
);

router.post(
  '/analyze',
  authGuard,
  validate({ body: pronunciationAttemptSchema }),
  asyncHandler(pronunciationController.attempt),
);

export default router;
