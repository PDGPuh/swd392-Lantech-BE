import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/utils/response';

// ---- Languages CRUD ----
const createLanguage = async (req: Request, res: Response) => {
  const lang = await prisma.language.create({ data: req.body });
  sendCreated(res, lang);
};

const updateLanguage = async (req: Request, res: Response) => {
  const lang = await prisma.language.update({
    where: { id: req.params.id as string },
    data: req.body,
  });
  sendSuccess(res, lang);
};

const deleteLanguage = async (req: Request, res: Response) => {
  await prisma.language.delete({ where: { id: req.params.id as string } });
  sendNoContent(res);
};

// ---- Lessons CRUD ----
const createLesson = async (req: Request, res: Response) => {
  const lesson = await prisma.lesson.create({ data: req.body });
  sendCreated(res, lesson);
};

const updateLesson = async (req: Request, res: Response) => {
  const lesson = await prisma.lesson.update({
    where: { id: req.params.id as string },
    data: req.body,
  });
  sendSuccess(res, lesson);
};

const deleteLesson = async (req: Request, res: Response) => {
  await prisma.lesson.delete({ where: { id: req.params.id as string } });
  sendNoContent(res);
};

// ---- Exercises CRUD ----
const createExercise = async (req: Request, res: Response) => {
  const exercise = await prisma.exercise.create({ data: req.body });
  sendCreated(res, exercise);
};

const updateExercise = async (req: Request, res: Response) => {
  const exercise = await prisma.exercise.update({
    where: { id: req.params.id as string },
    data: req.body,
  });
  sendSuccess(res, exercise);
};

const deleteExercise = async (req: Request, res: Response) => {
  await prisma.exercise.delete({ where: { id: req.params.id as string } });
  sendNoContent(res);
};

// ---- Placement Questions CRUD ----
const createPlacementQuestion = async (req: Request, res: Response) => {
  const q = await prisma.placementQuestion.create({ data: req.body });
  sendCreated(res, q);
};

const updatePlacementQuestion = async (req: Request, res: Response) => {
  const q = await prisma.placementQuestion.update({
    where: { id: req.params.id as string },
    data: req.body,
  });
  sendSuccess(res, q);
};

const deletePlacementQuestion = async (req: Request, res: Response) => {
  await prisma.placementQuestion.delete({ where: { id: req.params.id as string } });
  sendNoContent(res);
};

// ---- Badges CRUD ----
const createBadge = async (req: Request, res: Response) => {
  const badge = await prisma.badge.create({ data: req.body });
  sendCreated(res, badge);
};

const updateBadge = async (req: Request, res: Response) => {
  const badge = await prisma.badge.update({
    where: { id: req.params.id as string },
    data: req.body,
  });
  sendSuccess(res, badge);
};

const deleteBadge = async (req: Request, res: Response) => {
  await prisma.badge.delete({ where: { id: req.params.id as string } });
  sendNoContent(res);
};

// ---- Users list ----
const listUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      sourceLanguageCode: true,
      currentCefrLevel: true,
      xp: true,
      streakCount: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, users);
};

// ---- Analytics ----
const getAnalytics = async (req: Request, res: Response) => {
  const [totalUsers, totalLessons, totalExercises, totalVocabulary] = await Promise.all([
    prisma.user.count(),
    prisma.lesson.count(),
    prisma.exercise.count(),
    prisma.vocabulary.count(),
  ]);

  const analytics = {
    totalUsers,
    totalLessons,
    totalExercises,
    totalVocabulary,
  };

  sendSuccess(res, analytics);
};

export const adminController = {
  createLanguage,
  updateLanguage,
  deleteLanguage,
  createLesson,
  updateLesson,
  deleteLesson,
  createExercise,
  updateExercise,
  deleteExercise,
  createPlacementQuestion,
  updatePlacementQuestion,
  deletePlacementQuestion,
  createBadge,
  updateBadge,
  deleteBadge,
  listUsers,
  getAnalytics,
};
