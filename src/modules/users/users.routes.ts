import { Router } from 'express';
import { usersController } from './users.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { validate } from '../../common/middlewares/validate';
import { authGuard } from '../../common/middlewares/auth';
import {
  updateProfileSchema,
  updateSourceLanguageSchema,
  updateTargetLevelSchema,
} from './users.validation';

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/me', authGuard, asyncHandler(usersController.getMe));

/**
 * @swagger
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update current user profile
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               avatarUrl: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Updated user profile
 */
router.patch(
  '/me',
  authGuard,
  validate({ body: updateProfileSchema }),
  asyncHandler(usersController.updateMe),
);

/**
 * @swagger
 * /users/me/source-language:
 *   patch:
 *     tags: [Users]
 *     summary: Change source language
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sourceLanguageCode]
 *             properties:
 *               sourceLanguageCode: { type: string, example: ja }
 *     responses:
 *       200:
 *         description: Source language updated
 */
router.patch(
  '/me/source-language',
  authGuard,
  validate({ body: updateSourceLanguageSchema }),
  asyncHandler(usersController.updateSourceLanguage),
);

/**
 * @swagger
 * /users/me/target-level:
 *   patch:
 *     tags: [Users]
 *     summary: Update CEFR level
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentCefrLevel]
 *             properties:
 *               currentCefrLevel: { type: string, enum: [A1, A2, B1, B2, C1] }
 *     responses:
 *       200:
 *         description: CEFR level updated
 */
router.patch(
  '/me/target-level',
  authGuard,
  validate({ body: updateTargetLevelSchema }),
  asyncHandler(usersController.updateTargetLevel),
);

export default router;
