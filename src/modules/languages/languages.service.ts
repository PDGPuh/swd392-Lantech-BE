import prisma from '../../config/prisma';

export class LanguagesService {
  async getAll() {
    return prisma.language.findMany({ orderBy: { name: 'asc' } });
  }

  async getSourceLanguages() {
    return prisma.language.findMany({
      where: { isSourceSupported: true },
      orderBy: { name: 'asc' },
    });
  }

  async getTargetLanguages() {
    return prisma.language.findMany({
      where: { isTargetSupported: true },
      orderBy: { name: 'asc' },
    });
  }
}

export const languagesService = new LanguagesService();
