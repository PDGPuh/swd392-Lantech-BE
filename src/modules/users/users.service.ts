import prisma from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';
import { CefrLevel } from '@prisma/client';

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        sourceLanguageCode: true,
        targetLanguageCode: true,
        currentCefrLevel: true,
        xp: true,
        streakCount: true,
        lastStudyDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw AppError.notFound('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { fullName?: string; avatarUrl?: string | null }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        sourceLanguageCode: true,
        targetLanguageCode: true,
        currentCefrLevel: true,
        xp: true,
        streakCount: true,
        lastStudyDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async updateSourceLanguage(userId: string, sourceLanguageCode: string) {
    // Verify language exists and is supported
    const language = await prisma.language.findUnique({ where: { code: sourceLanguageCode } });
    if (!language || !language.isSourceSupported) {
      throw AppError.badRequest(
        `Language '${sourceLanguageCode}' is not supported as source language`,
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { sourceLanguageCode },
      select: {
        id: true,
        email: true,
        fullName: true,
        sourceLanguageCode: true,
        targetLanguageCode: true,
        currentCefrLevel: true,
      },
    });
    return user;
  }

  async updateTargetLevel(userId: string, currentCefrLevel: CefrLevel) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { currentCefrLevel },
      select: {
        id: true,
        email: true,
        fullName: true,
        sourceLanguageCode: true,
        targetLanguageCode: true,
        currentCefrLevel: true,
      },
    });
    return user;
  }
}

export const usersService = new UsersService();
