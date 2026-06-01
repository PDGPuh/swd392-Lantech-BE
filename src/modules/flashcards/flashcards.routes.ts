import { Router } from 'express';
import { flashcardsController } from './flashcards.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { validate } from '../../common/middlewares/validate';
import { authGuard } from '../../common/middlewares/auth';
import { reviewFlashcardSchema } from './flashcards.validation';

const router = Router();

/**
 * @swagger
 * /flashcards/due:
 *   get:
 *     tags: [Flashcards]
 *     summary: Get due flashcards for review
 *     responses:
 *       200:
 *         description: List of due flashcards
 */
router.get('/due', authGuard, asyncHandler(flashcardsController.getDue));

/**
 * @swagger
 * /flashcards/create-from-vocabulary/{vocabularyId}:
 *   post:
 *     tags: [Flashcards]
 *     summary: Create flashcard from vocabulary
 *     parameters:
 *       - in: path
 *         name: vocabularyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Flashcard created
 */
router.post(
  '/create-from-vocabulary/:vocabularyId',
  authGuard,
  asyncHandler(flashcardsController.createFromVocabulary),
);

/**
 * @swagger
 * /flashcards/{id}/review:
 *   post:
 *     tags: [Flashcards]
 *     summary: Review a flashcard (SM-2 algorithm)
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
 *             required: [quality]
 *             properties:
 *               quality:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 5
 *                 description: "0=blackout, 1=wrong but remembered, 2=wrong but easy, 3=correct hard, 4=correct hesitation, 5=perfect"
 *     responses:
 *       200:
 *         description: Review result with updated SRS data
 */
router.post(
  '/:id/review',
  authGuard,
  validate({ body: reviewFlashcardSchema }),
  asyncHandler(flashcardsController.review),
);

export default router;
