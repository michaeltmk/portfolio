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

    // Validate and clean message sequence
    if (!Array.isArray(messages)) {
      throw new Error('Messages must be an array');
    }

    // Basic validation for message structure
    const validatedMessages = messages.filter((msg, index) => {
      if (!msg || typeof msg !== 'object') {
        console.warn(`[CHAT-API] Skipping invalid message at index ${index}:`, msg);
        return false;
      }
      
      if (!msg.role || !msg.content) {
        console.warn(`[CHAT-API] Skipping message with missing role/content at index ${index}:`, msg);
        return false;
      }
      
      // Ensure valid roles
      if (!['system', 'user', 'assistant', 'tool'].includes(msg.role)) {
        console.warn(`[CHAT-API] Skipping message with invalid role '${msg.role}' at index ${index}`);
        return false;
      }
      
      return true;
    });

    if (validatedMessages.length === 0) {
      throw new Error('No valid messages provided');
    }

    console.log(`[CHAT-API] Validated ${validatedMessages.length} out of ${messages.length} messages`);

    // Log provider status for debugging
    const providerStatus = getProviderStatus();
    console.log('[CHAT-API] Provider status:', {
      primary: providerStatus.primary?.[1]?.name || 'None',
      availableProviders: providerStatus.availableProviders,
      fallbackChain: providerStatus.fallbackChain.map(p => p.name)
    });

    validatedMessages.unshift(SYSTEM_PROMPT);

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
      messages: validatedMessages,
      toolCallStreaming: true, // AI client will handle OpenAI-Compatible streaming issues
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
    console.error('Global chat API error:', err);
    const errorMessage = errorHandler(err);
    
    // Return appropriate HTTP status codes for different errors
    let status = 500;
    let clientMessage = errorMessage;
    
    if (typeof errorMessage === 'string') {
      if (errorMessage.includes('No valid messages') || errorMessage.includes('Messages must be an array')) {
        status = 400;
        clientMessage = 'Invalid message format provided';
      } else if (errorMessage.includes('conversation format') || errorMessage.includes('role')) {
        status = 422;
        clientMessage = 'Invalid conversation sequence. Please start a new conversation.';
      } else if (errorMessage.includes('authentication') || errorMessage.includes('API key')) {
        status = 503;
        clientMessage = 'AI service temporarily unavailable';
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        status = 429;
        clientMessage = 'Rate limit exceeded. Please try again later.';
      } else if (errorMessage.includes('providers') || errorMessage.includes('unavailable')) {
        status = 503;
        clientMessage = 'AI services temporarily unavailable';
      }
    }
    
    return new Response(
      JSON.stringify({ error: clientMessage }), 
      { 
        status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
