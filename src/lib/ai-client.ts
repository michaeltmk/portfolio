import { mistral } from '@ai-sdk/mistral';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText, LanguageModel } from 'ai';
import { AIProviderConfig, getFallbackChain, getPrimaryProvider } from './ai-providers';

// Create AI model instances
function createAIModel(providerKey: string, config: AIProviderConfig, modelName?: string): LanguageModel {
  const model = modelName || config.models[0];
  
  switch (providerKey) {
    case 'mistral':
      return mistral(model);
      
    case 'openai':
      return openai(model);
      
    case 'google':
      return google(model);
      
    case 'anthropic':
      return anthropic(model);
      
    case 'openrouter':
      const openrouter = createOpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: config.apiKey,
        headers: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'Yuvraj Singh Portfolio'
        }
      });
      return openrouter(model);
      
    case 'openai-compatible':
      if (!config.baseURL) {
        throw new Error('OpenAI-compatible provider requires baseURL');
      }
      const openaiCompatible = createOpenAICompatible({
        baseURL: config.baseURL,
        apiKey: config.apiKey,
        name: 'openai-compatible'
      });
      return openaiCompatible(model);
      
    case 'custom':
      if (!config.baseURL) {
        throw new Error('Custom provider requires baseURL');
      }
      const customProvider = createOpenAICompatible({
        baseURL: config.baseURL,
        apiKey: config.apiKey,
        name: 'custom-provider'
      });
      return customProvider(model);
      
    default:
      throw new Error(`Unsupported AI provider: ${providerKey}`);
  }
}

// Enhanced streamText with automatic fallback
export async function streamTextWithFallback(options: {
  messages: any[];
  tools?: any;
  maxSteps?: number;
  toolCallStreaming?: boolean;
  onStepFinish?: (step: any) => void;
  preferredProvider?: string;
  preferredModel?: string;
}) {
  const {
    messages,
    tools,
    maxSteps = 2,
    toolCallStreaming = true,
    onStepFinish,
    preferredProvider,
    preferredModel
  } = options;

  // Get the primary provider or use preferred
  const primaryProvider = preferredProvider 
    ? [preferredProvider, null] 
    : getPrimaryProvider();

  if (!primaryProvider) {
    throw new Error('No AI providers available. Please configure at least one API key.');
  }

  // Get fallback chain starting from primary/preferred provider
  const fallbackChain = getFallbackChain(primaryProvider[0] || 'mistral');
  
  console.log('[AI-PROVIDER] Available fallback chain:', fallbackChain.map(([key]) => key));

  // Try each provider in the fallback chain
  for (let i = 0; i < fallbackChain.length; i++) {
    const [providerKey, config] = fallbackChain[i];
    
    if (!config) continue;

    try {
      console.log(`[AI-PROVIDER] Attempting provider: ${config.name} (${providerKey})`);
      
      const model = createAIModel(providerKey, config, preferredModel);
      
      const result = streamText({
        model,
        messages,
        toolCallStreaming,
        tools,
        maxSteps,
        onStepFinish: (step) => {
          console.log(`[AI-PROVIDER] ${config.name} - Step finished:`, {
            stepType: step.stepType,
            toolCalls: step.toolCalls?.map(tc => ({
              toolCallId: tc.toolCallId,
              toolName: tc.toolName,
              args: tc.args
            }))
          });
          onStepFinish?.(step);
        },
        maxTokens: config.maxTokens,
        temperature: config.temperature,
      });

      console.log(`[AI-PROVIDER] Successfully using: ${config.name} (${providerKey})`);
      return result;

    } catch (error: any) {
      console.warn(`[AI-PROVIDER] ${config.name} failed:`, error.message);
      
      // If this is the last provider in the chain, throw the error
      if (i === fallbackChain.length - 1) {
        console.error('[AI-PROVIDER] All providers failed, throwing error');
        throw new Error(`All AI providers failed. Last error: ${error.message}`);
      }
      
      // Continue to next provider
      console.log(`[AI-PROVIDER] Falling back to next provider...`);
    }
  }

  throw new Error('No AI providers available');
}

// Helper function to get provider status
export function getProviderStatus() {
  const fallbackChain = getFallbackChain(getPrimaryProvider()?.[0] || 'mistral');
  
  return {
    primary: getPrimaryProvider(),
    availableProviders: fallbackChain.length,
    fallbackChain: fallbackChain.map(([key, config]) => ({
      key,
      name: config?.name || key,
      hasApiKey: Boolean(config?.apiKey)
    }))
  };
}
