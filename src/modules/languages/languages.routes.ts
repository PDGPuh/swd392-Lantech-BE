import { Router } from 'express';
import { languagesController } from './languages.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';

const router = Router();

/**
 * @swagger
 * /languages:
 *   get:
 *     tags: [Languages]
 *     summary: Get all languages
 *     security: []
 *     responses:
 *       200:
 *         description: List of all languages
 */
router.get('/', asyncHandler(languagesController.getAll));

/**
 * @swagger
 * /languages/source:
 *   get:
 *     tags: [Languages]
 *     summary: Get supported source languages
 *     security: []
 *     responses:
 *       200:
 *         description: List of source languages
 */
router.get('/source', asyncHandler(languagesController.getSource));

/**
 * @swagger
 * /languages/target:
 *   get:
 *     tags: [Languages]
 *     summary: Get supported target languages
 *     security: []
 *     responses:
 *       200:
 *         description: List of target languages
 */
router.get('/target', asyncHandler(languagesController.getTarget));

export default router;
