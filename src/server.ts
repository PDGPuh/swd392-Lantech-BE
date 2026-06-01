import app from './app';
import { env } from './config/env';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 LinguaQuest Backend running on port ${PORT}`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
  console.log(`🔧 Environment: ${env.NODE_ENV}`);
  console.log(`🤖 AI Provider: ${env.AI_PROVIDER}`);
});
