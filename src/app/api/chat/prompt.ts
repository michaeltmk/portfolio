import { generateSystemPrompt } from '@/lib/config';

export const SYSTEM_PROMPT = {
  role: 'system',
  content: generateSystemPrompt(),
};
