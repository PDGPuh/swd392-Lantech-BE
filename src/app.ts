import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './common/middlewares/errorHandler';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import languagesRoutes from './modules/languages/languages.routes';
import placementRoutes from './modules/placement/placement.routes';
import learningPathsRoutes from './modules/learning-paths/learning-paths.routes';
import lessonsRoutes from './modules/lessons/lessons.routes';
import exercisesRoutes from './modules/exercises/exercises.routes';
import vocabularyRoutes from './modules/vocabulary/vocabulary.routes';
import flashcardsRoutes from './modules/flashcards/flashcards.routes';
import pronunciationRoutes from './modules/pronunciation/pronunciation.routes';
import aiRoutes from './modules/ai/ai.routes';
import gamificationRoutes from './modules/gamification/gamification.routes';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static('frontend'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger docs
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'LinguaQuest API Docs',
  }),
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/languages', languagesRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/learning-paths', learningPathsRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/flashcards', flashcardsRoutes);
app.use('/api/pronunciation', pronunciationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
