import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // LANGUAGES
  const languages = [
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', isSourceSupported: true, isTargetSupported: false },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', isSourceSupported: true, isTargetSupported: false },
    { code: 'ko', name: 'Korean', nativeName: '한국어', isSourceSupported: true, isTargetSupported: false },
    { code: 'zh', name: 'Chinese', nativeName: '中文', isSourceSupported: true, isTargetSupported: false },
    { code: 'en', name: 'English', nativeName: 'English', isSourceSupported: false, isTargetSupported: true },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({ where: { code: lang.code }, update: lang, create: lang });
  }
  console.log('✅ Languages seeded');

  // USERS
  const adminHash = await bcrypt.hash('Admin@123456', 10);
  const userHash = await bcrypt.hash('User@123456', 10);

  await prisma.user.upsert({
    where: { email: 'admin@lantech.local' },
    update: {},
    create: { email: 'admin@lantech.local', passwordHash: adminHash, fullName: 'Admin User', role: 'ADMIN', sourceLanguageCode: 'vi', targetLanguageCode: 'en', currentCefrLevel: 'C1' },
  });

  await prisma.user.upsert({
    where: { email: 'user@lantech.local' },
    update: {},
    create: { email: 'user@lantech.local', passwordHash: userHash, fullName: 'Test User', role: 'USER', sourceLanguageCode: 'vi', targetLanguageCode: 'en', currentCefrLevel: 'A1' },
  });
  console.log('✅ Users seeded');

  // BADGES
  const badges = [
    { code: 'FIRST_LESSON', name: 'First Lesson', description: 'Complete your first lesson', conditionType: 'FIRST_LESSON' as const, conditionValue: 1 },
    { code: '7_DAY_STREAK', name: '7-Day Streak', description: 'Study for 7 consecutive days', conditionType: 'STREAK_DAYS' as const, conditionValue: 7 },
    { code: '1000_XP', name: '1000 XP', description: 'Earn 1000 XP total', conditionType: 'TOTAL_XP' as const, conditionValue: 1000 },
    { code: 'FIRST_REVIEW', name: 'First Review', description: 'Complete your first flashcard review', conditionType: 'FIRST_FLASHCARD_REVIEW' as const, conditionValue: 1 },
    { code: 'PERFECT', name: 'Perfect Score', description: 'Complete a lesson with 100%', conditionType: 'PERFECT_LESSON' as const, conditionValue: 1 },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({ where: { code: badge.code }, update: badge, create: badge });
  }
  console.log('✅ Badges seeded');

  // LESSONS
  const lessonData = [
    { title: 'Basic Greetings', description: 'Learn common English greetings', skill: 'VOCABULARY' as const, orderIndex: 1 },
    { title: 'Subject Pronouns', description: 'Learn I, you, he, she, it, we, they', skill: 'GRAMMAR' as const, orderIndex: 2 },
    { title: 'Simple Present Tense', description: 'Learn simple present tense verbs', skill: 'GRAMMAR' as const, orderIndex: 3 },
    { title: 'Listening: Introductions', description: 'Listen and understand self-introductions', skill: 'LISTENING' as const, orderIndex: 4 },
    { title: 'Speaking: Greetings', description: 'Practice greeting pronunciation', skill: 'SPEAKING' as const, orderIndex: 5 },
  ];

  for (const l of lessonData) {
    const lesson = await prisma.lesson.create({
      data: { ...l, cefrLevel: 'A1', targetLanguageCode: 'en', xpReward: 10, estimatedMinutes: 15 },
    });

    // Create 3 exercises per lesson
    const exercises = [
      { type: 'MULTIPLE_CHOICE' as const, prompt: `${l.title} - Question 1: Choose the correct answer`, instruction: 'Select the best option', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', explanation: 'Option A is correct.', orderIndex: 1 },
      { type: 'FILL_BLANK' as const, prompt: `${l.title} - Question 2: Fill in the blank`, instruction: 'Type the missing word', correctAnswer: 'hello', explanation: 'The correct word is "hello".', orderIndex: 2 },
      { type: 'MULTIPLE_CHOICE' as const, prompt: `${l.title} - Question 3: Choose the correct answer`, instruction: 'Select the best option', options: ['A', 'B', 'C', 'D'], correctAnswer: 'B', explanation: 'Option B is correct.', orderIndex: 3 },
    ];

    for (const ex of exercises) {
      await prisma.exercise.create({
        data: { ...ex, lessonId: lesson.id, difficulty: 1, xpReward: 5 },
      });
    }
  }
  console.log('✅ Lessons & Exercises seeded');

  // PLACEMENT QUESTIONS
  const placementQuestions = [
    { level: 'A1' as const, questionText: 'What is the English word for "xin chào"?', options: ['Hello', 'Goodbye', 'Thank you', 'Please'], correctAnswer: 'Hello', skill: 'VOCABULARY' as const },
    { level: 'A1' as const, questionText: 'Choose the correct pronoun: "___ am a student."', options: ['I', 'He', 'They', 'We'], correctAnswer: 'I', skill: 'GRAMMAR' as const },
    { level: 'A2' as const, questionText: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], correctAnswer: 'goes', skill: 'GRAMMAR' as const },
    { level: 'B1' as const, questionText: 'If I ___ rich, I would travel the world.', options: ['am', 'was', 'were', 'be'], correctAnswer: 'were', skill: 'GRAMMAR' as const },
    { level: 'B2' as const, questionText: 'The report ___ by the time the meeting started.', options: ['has been finished', 'had been finished', 'was finishing', 'finished'], correctAnswer: 'had been finished', skill: 'GRAMMAR' as const },
  ];

  for (const q of placementQuestions) {
    await prisma.placementQuestion.create({ data: q });
  }
  console.log('✅ Placement questions seeded');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });