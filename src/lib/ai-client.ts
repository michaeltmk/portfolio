import { mistral } from '@ai-sdk/mistral';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText, generateText, createDataStreamResponse } from 'ai';
import { AIProviderConfig, getFallbackChain, getPrimaryProvider } from './ai-providers';

// Create AI model instances
function createAIModel(providerKey: string, config: AIProviderConfig, modelName?: string) {
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
      
      // Check if this provider has streaming issues and use non-streaming instead
      const hasStreamingIssues = providerKey === 'openai-compatible' || providerKey === 'custom';
      
      if (hasStreamingIssues) {
        console.log(`[AI-PROVIDER] ${config.name} - Using custom OpenAI-Compatible handler due to AI SDK parsing issues`);
        
        // For OpenAI-Compatible API, use direct fetch since AI SDK has parsing issues
        if (providerKey === 'custom') {
          try {
            const payload = {
              model: preferredModel || config.models?.[0] || 'gpt-4.1',
              messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              temperature: config.temperature || 0.7,
              stream: false
            };
            
            console.log(`[AI-PROVIDER] Direct API call to:`, config.baseURL);
            console.log(`[AI-PROVIDER] Payload:`, JSON.stringify(payload, null, 2));
            
            const response = await fetch(`${config.baseURL}/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
              },
              body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
              throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`[AI-PROVIDER] Raw API response:`, JSON.stringify(data, null, 2));
            
            const content = data.choices?.[0]?.message?.content || '';
            console.log(`[AI-PROVIDER] Extracted content:`, content);
            
            // Create a generateText-compatible result
            const generateResult = {
              text: content,
              finishReason: data.choices?.[0]?.finish_reason || 'stop',
              usage: {
                promptTokens: data.usage?.prompt_tokens || 0,
                completionTokens: data.usage?.completion_tokens || 0,
                totalTokens: data.usage?.total_tokens || 0
              },
              toolCalls: [],
              toolResults: [],
              files: [],
              reasoningDetails: [],
              warnings: []
            };
            
            console.log(`[AI-PROVIDER] Successfully using direct API: ${config.name} (${providerKey})`);
            console.log(`[AI-PROVIDER] Generated text preview:`, generateResult.text?.substring(0, 100));
            console.log(`[AI-PROVIDER] Full text length:`, generateResult.text?.length);
            
            // Convert to streamText-compatible object - continuing with existing code...
            const streamCompatibleResult = {
              ...generateResult,
              textStream: (async function* () {
                if (generateResult.text) {
                  yield generateResult.text;
                }
              })(),
              toDataStreamResponse: (options: any) => {
                console.log(`[AI-PROVIDER] Creating data stream response for text:`, generateResult.text?.substring(0, 50));
                
                const encoder = new TextEncoder();
                const stream = new ReadableStream({
                  start(controller) {
                    try {
                      if (generateResult.text) {
                        // Properly escape the text for JSON
                        const escapedText = JSON.stringify(generateResult.text);
                        const textChunk = `0:${escapedText}\n`;
                        console.log(`[AI-PROVIDER] Sending text chunk:`, textChunk.substring(0, 100));
                        controller.enqueue(encoder.encode(textChunk));
                      }
                      
                      const finishChunk = `d:{"finishReason":"${generateResult.finishReason || 'stop'}"}\n`;
                      console.log(`[AI-PROVIDER] Sending finish chunk:`, finishChunk);
                      controller.enqueue(encoder.encode(finishChunk));
                      
                      controller.close();
                    } catch (error) {
                      console.error('[AI-PROVIDER] Stream error:', error);
                      controller.error(error);
                    }
                  }
                });

                return new Response(stream, {
                  headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'X-Vercel-AI-Data-Stream': 'v1'
                  }
                });
              }
            };
            
            return streamCompatibleResult;
            
          } catch (error) {
            console.error(`[AI-PROVIDER] Direct API error for ${config.name}:`, error);
            // Fall back to next provider
            continue;
          }
        }
        
        // For other problematic providers, use generateText (completely non-streaming)
        const generateResult = await generateText({
          model: model as any,
          messages,
          tools,
          maxSteps,
          maxTokens: config.maxTokens,
          temperature: config.temperature,
        });

        console.log(`[AI-PROVIDER] Successfully using non-streaming: ${config.name} (${providerKey})`);
        console.log(`[AI-PROVIDER] Generated text preview:`, generateResult.text?.substring(0, 100));
        console.log(`[AI-PROVIDER] Full text length:`, generateResult.text?.length);
        console.log(`[AI-PROVIDER] Full result keys:`, Object.keys(generateResult));
        console.log(`[AI-PROVIDER] Usage:`, generateResult.usage);
        console.log(`[AI-PROVIDER] Finish reason:`, generateResult.finishReason);
        
        // Convert generateText result to streamText-compatible object
        const streamCompatibleResult = {
          ...generateResult,
          textStream: (async function* () {
            if (generateResult.text) {
              yield generateResult.text;
            }
          })(),
          toDataStreamResponse: (options: any) => {
            console.log(`[AI-PROVIDER] Creating data stream response for text:`, generateResult.text?.substring(0, 50));
            
            // Create a response that simulates streaming but sends all text at once
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
              start(controller) {
                try {
                  if (generateResult.text) {
                    // Properly escape the text for JSON
                    const escapedText = JSON.stringify(generateResult.text);
                    const textChunk = `0:${escapedText}\n`;
                    console.log(`[AI-PROVIDER] Sending text chunk:`, textChunk.substring(0, 100));
                    controller.enqueue(encoder.encode(textChunk));
                  }
                  
                  // Send completion
                  const finishChunk = `d:{"finishReason":"${generateResult.finishReason || 'stop'}"}\n`;
                  console.log(`[AI-PROVIDER] Sending finish chunk:`, finishChunk);
                  controller.enqueue(encoder.encode(finishChunk));
                  
                  controller.close();
                } catch (error) {
                  console.error('[AI-PROVIDER] Stream error:', error);
                  if (options?.getErrorMessage) {
                    const errorMsg = options.getErrorMessage(error);
                    controller.enqueue(encoder.encode(`error:${errorMsg}\n`));
                  }
                  controller.error(error);
                }
              }
            });

            return new Response(stream, {
              headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Vercel-AI-Data-Stream': 'v1'
              }
            });
          }
        };
        
        return streamCompatibleResult;
        
      } else {
        // Use normal streaming for providers without issues
        console.log(`[AI-PROVIDER] ${config.name} - Using streaming mode`);
        const result = streamText({
          model: model as any,
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

        console.log(`[AI-PROVIDER] Successfully using streaming: ${config.name} (${providerKey})`);
        return result;
      }

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
