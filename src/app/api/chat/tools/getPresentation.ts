import { tool } from 'ai';
import { z } from 'zod';

export const getPresentation = tool({
  description:
    'This tool returns a concise personal introduction of Michael Tse. It is used to answer the question "Who are you?" or "Tell me about yourself"',
  parameters: z.object({}),
  execute: async () => {
    return {
      presentation:
        "Here is a little bit about me, you can see it above!",
        //"I'm Michael Tse (you can call me Mike), a developer passionate about software development, AI, and machine learning. I love tackling new challenges, learning, and building innovative solutions. Beyond tech, I enjoy riding my bike and playing snooker.",
    };
  },
});