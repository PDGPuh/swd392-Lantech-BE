import prisma from '../../config/prisma';
import { AppError } from '../../common/errors/AppError';
import { CefrLevel } from '@prisma/client';

export class VocabularyService {
  async findAll(filters: { level?: string; sourceLanguageCode?: string }) {
    const where: Record<string, unknown> = {};
    if (filters.level) where.cefrLevel = filters.level as CefrLevel;

    const vocabularies = await prisma.vocabulary.findMany({
      where,
      orderBy: { word: 'asc' },
      include: {
        translations: filters.sourceLanguageCode
          ? { where: { languageCode: filters.sourceLanguageCode } }
          : { take: 5 },
      },
    });

    return vocabularies;
  }

  async findById(id: string) {
    const vocabulary = await prisma.vocabulary.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!vocabulary) throw AppError.notFound('Vocabulary not found');
    return vocabulary;
  }

  // Admin CRUD
  async create(data: {
    word: string;
    ipa?: string;
    audioUrl?: string;
    cefrLevel: CefrLevel;
    partOfSpeech?: string;
    exampleSentence?: string;
  }) {
    return prisma.vocabulary.create({ data });
  }

  async update(
    id: string,
    data: {
      word?: string;
      ipa?: string;
      audioUrl?: string;
      cefrLevel?: CefrLevel;
      partOfSpeech?: string;
      exampleSentence?: string;
    },
  ) {
    const exists = await prisma.vocabulary.findUnique({ where: { id } });
    if (!exists) throw AppError.notFound('Vocabulary not found');
    return prisma.vocabulary.update({ where: { id }, data });
  }

  async delete(id: string) {
    const exists = await prisma.vocabulary.findUnique({ where: { id } });
    if (!exists) throw AppError.notFound('Vocabulary not found');
    await prisma.vocabulary.delete({ where: { id } });
  }
}

export const vocabularyService = new VocabularyService();
