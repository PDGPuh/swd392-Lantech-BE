import { Router } from 'express';
import { adminController } from './admin.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authGuard, requireRole } from '../../common/middlewares/auth';

const router = Router();

// All admin routes require ADMIN role
router.use(authGuard, requireRole('ADMIN'));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users (admin only)
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', asyncHandler(adminController.listUsers));

// Languages
router.post('/languages', asyncHandler(adminController.createLanguage));
router.patch('/languages/:id', asyncHandler(adminController.updateLanguage));
router.delete('/languages/:id', asyncHandler(adminController.deleteLanguage));

// Lessons
router.post('/lessons', asyncHandler(adminController.createLesson));
router.patch('/lessons/:id', asyncHandler(adminController.updateLesson));
router.delete('/lessons/:id', asyncHandler(adminController.deleteLesson));

// Exercises
router.post('/exercises', asyncHandler(adminController.createExercise));
router.patch('/exercises/:id', asyncHandler(adminController.updateExercise));
router.delete('/exercises/:id', asyncHandler(adminController.deleteExercise));

// Placement Questions
router.post('/placement-questions', asyncHandler(adminController.createPlacementQuestion));
router.patch('/placement-questions/:id', asyncHandler(adminController.updatePlacementQuestion));
router.delete('/placement-questions/:id', asyncHandler(adminController.deletePlacementQuestion));

// Badges
router.post('/badges', asyncHandler(adminController.createBadge));
router.patch('/badges/:id', asyncHandler(adminController.updateBadge));
router.delete('/badges/:id', asyncHandler(adminController.deleteBadge));

export default router;
