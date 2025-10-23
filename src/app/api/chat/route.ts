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
    const { messages, fallback_number } = await req.json();
    console.log('[CHAT-API] Incoming messages:', messages);
    console.log('[CHAT-API] Fallback number:', fallback_number);

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

    // Determine which provider to use based on fallback_number
    let selectedProvider = null;
    const currentPrimary = process.env.AI_PRIMARY_PROVIDER || 'mistral';
    const fallbackProviders = (process.env.AI_FALLBACK_PROVIDERS || '').split(',').filter(p => p.trim());
    
    if (!fallback_number || fallback_number === 0) {
      // Use primary provider
      selectedProvider = currentPrimary;
      console.log('[CHAT-API] Using primary provider:', selectedProvider);
    } else {
      // Use fallback provider based on fallback_number (1-indexed)
      const fallbackIndex = fallback_number - 1;
      if (fallbackIndex < fallbackProviders.length) {
        selectedProvider = fallbackProviders[fallbackIndex].trim();
        console.log(`[CHAT-API] Using fallback provider #${fallback_number}:`, selectedProvider);
      } else {
        console.error(`[CHAT-API] Invalid fallback_number ${fallback_number}, max available: ${fallbackProviders.length}`);
        throw new Error(`Invalid fallback provider index. Available fallback providers: ${fallbackProviders.length}`);
      }
    }

    console.log('[CHAT-API] Provider selection:', {
      primary: currentPrimary,
      fallbackProviders: fallbackProviders,
      selectedProvider: selectedProvider,
      fallbackNumber: fallback_number
    });

    // First attempt with primary provider
    let result;
    try {
      console.log('[CHAT-API] Attempting with primary provider chain...');
      result = await streamTextWithFallback({
        messages: validatedMessages,
        toolCallStreaming: true,
        tools,
        maxSteps: 2,
        preferredProvider: selectedProvider, // Use the selected provider
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
    } catch (primaryError: any) {
      console.error('[CHAT-API] Primary provider chain failed:', primaryError.message);
      console.error('[CHAT-API] Full error object:', JSON.stringify(primaryError, null, 2));
      
      // Always attempt fallback for ANY error - let the fallback chain handle it
      console.log('[CHAT-API] Attempting fallback with next available providers...');
      
      // Get the current primary provider to skip it in fallback
      const currentPrimary = process.env.AI_PRIMARY_PROVIDER || 'mistral';
      const fallbackProviders = (process.env.AI_FALLBACK_PROVIDERS || '').split(',').filter(p => p.trim());
      
      console.log('[CHAT-API] Current primary:', currentPrimary);
      console.log('[CHAT-API] Available fallback providers:', fallbackProviders);
      
      // Try each fallback provider in order
      for (const fallbackProvider of fallbackProviders) {
        const trimmedProvider = fallbackProvider.trim();
        if (trimmedProvider === currentPrimary) {
          console.log(`[CHAT-API] Skipping ${trimmedProvider} (already failed as primary)`);
          continue; // Skip the provider that already failed
        }
        
        try {
          console.log(`[CHAT-API] Trying fallback provider: ${trimmedProvider}`);
          result = await streamTextWithFallback({
            messages: validatedMessages,
            toolCallStreaming: true,
            tools,
            maxSteps: 2,
            preferredProvider: trimmedProvider,
            onStepFinish: (step) => {
              console.log(`[CHAT-API] ${trimmedProvider} step finished:`, {
                stepType: step.stepType,
                toolCalls: step.toolCalls?.map((tc: any) => ({
                  toolCallId: tc.toolCallId,
                  toolName: tc.toolName,
                  args: tc.args
                }))
              });
            },
          });
          console.log(`[CHAT-API] ✅ Successfully recovered using fallback provider: ${trimmedProvider}`);
          break; // Success! Exit the fallback loop
        } catch (fallbackError: any) {
          console.error(`[CHAT-API] Fallback provider ${trimmedProvider} also failed:`, fallbackError.message);
          // Continue to next provider
        }
      }
      
      // If we get here and result is still undefined, all providers failed
      if (!result) {
        console.error('[CHAT-API] All providers failed, throwing original error');
        throw primaryError;
      }
    }

    console.log('[CHAT-API] AI request completed successfully');
    return result.toDataStreamResponse({
      getErrorMessage: errorHandler,
    });
  } catch (err) {
    console.error('[CHAT-API] Error caught in main handler:', err);
    const errorMessage = errorHandler(err);
    
    // Enhanced error logging for debugging
    if (err instanceof Error) {
      console.error('[CHAT-API] Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        cause: err.cause
      });
    }
    
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
      JSON.stringify({ 
        error: clientMessage,
        status: status,
        fallback_available: status >= 500 // Indicate to client that fallback should be tried
      }), 
      { 
        status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
