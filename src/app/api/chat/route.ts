import { streamText } from 'ai';
import { streamTextWithFallback, getProviderStatus } from '@/lib/ai-client';
import { SYSTEM_PROMPT } from './prompt';
import { getContact } from './tools/getContact';
import { getCrazy } from './tools/getCrazy';
import { getOpportunities } from './tools/getOpportunities';
import { getPresentation } from './tools/getPresentation';
import { getProjects } from './tools/getProjects';
import { getResume } from './tools/getResume';
import { getSkills } from './tools/getSkills';
import { getSports } from './tools/getSports';
import { getWeather } from './tools/getWeather';

export const maxDuration = 30;

// ❌ Pas besoin de l'export ici, Next.js n'aime pas ça
function errorHandler(error: unknown) {
  if (error == null) {
    return 'Unknown error';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log('[CHAT-API] Incoming messages:', messages);

    // Log provider status for debugging
    const providerStatus = getProviderStatus();
    console.log('[CHAT-API] Provider status:', {
      primary: providerStatus.primary?.[1]?.name || 'None',
      availableProviders: providerStatus.availableProviders,
      fallbackChain: providerStatus.fallbackChain.map(p => p.name)
    });

    messages.unshift(SYSTEM_PROMPT);

    const tools = {
      getProjects,
      getPresentation,
      getResume,
      getContact,
      getSkills,
      getSports,
      getCrazy,
      getOpportunities,
      getWeather,
    };

    const result = await streamTextWithFallback({
      messages,
      toolCallStreaming: true,
      tools,
      maxSteps: 2,
      onStepFinish: (step) => {
        console.log('[CHAT-API] Step finished:', {
          stepType: step.stepType,
          toolCalls: step.toolCalls?.map((tc: any) => ({
            toolCallId: tc.toolCallId,
            toolName: tc.toolName,
            args: tc.args
          }))
        });
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: errorHandler,
    });
  } catch (err) {
    console.error('Global error:', err);
    const errorMessage = errorHandler(err);
    return new Response(errorMessage, { status: 500 });
  }
}
