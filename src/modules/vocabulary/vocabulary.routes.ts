import { Router } from 'express';
import { vocabularyController } from './vocabulary.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authGuard, requireRole } from '../../common/middlewares/auth';

const router = Router();

/**
 * @swagger
 * /vocabulary:
 *   get:
 *     tags: [Vocabulary]
 *     summary: Get vocabulary list
 *     parameters:
 *       - in: query
 *         name: level
 *         schema: { type: string, enum: [A1, A2, B1, B2, C1] }
 *       - in: query
 *         name: sourceLanguageCode
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of vocabulary with translations
 */
router.get('/', authGuard, asyncHandler(vocabularyController.findAll));

/**
 * @swagger
 * /vocabulary/{id}:
 *   get:
 *     tags: [Vocabulary]
 *     summary: Get vocabulary by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vocabulary detail
 */
router.get('/:id', authGuard, asyncHandler(vocabularyController.findById));

/**
 * @swagger
 * /vocabulary/admin:
 *   post:
 *     tags: [Vocabulary, Admin]
 *     summary: Create vocabulary (admin only)
 *     responses:
 *       201:
 *         description: Vocabulary created
 */
router.post('/admin', authGuard, requireRole('ADMIN'), asyncHandler(vocabularyController.create));

/**
 * @swagger
 * /vocabulary/admin/{id}:
 *   patch:
 *     tags: [Vocabulary, Admin]
 *     summary: Update vocabulary (admin only)
 *     responses:
 *       200:
 *         description: Vocabulary updated
 */
router.patch(
  '/admin/:id',
  authGuard,
  requireRole('ADMIN'),
  asyncHandler(vocabularyController.update),
);

/**
 * @swagger
 * /vocabulary/admin/{id}:
 *   delete:
 *     tags: [Vocabulary, Admin]
 *     summary: Delete vocabulary (admin only)
 *     responses:
 *       204:
 *         description: Vocabulary deleted
 */
router.delete(
  '/admin/:id',
  authGuard,
  requireRole('ADMIN'),
  asyncHandler(vocabularyController.delete),
);

export default router;
