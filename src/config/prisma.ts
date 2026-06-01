import { PrismaClient } from '@prisma/client';
import { isDev } from './env';

const prisma = new PrismaClient({
  log: isDev ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;
