// AI Provider Configuration
export type AIProvider = 'mistral' | 'openai' | 'google' | 'openrouter' | 'anthropic' | 'custom' | 'openai-compatible';

export interface AIProviderConfig {
  name: string;
  baseURL?: string;
  apiKey: string;
  models: string[];
  maxTokens?: number;
  temperature?: number;
  fallbackProvider?: AIProvider;
}

export interface AIProviders {
  [key: string]: AIProviderConfig;
}

// Default AI provider configurations
export const defaultAIProviders: AIProviders = {
  mistral: {
    name: 'Mistral AI',
    apiKey: process.env.MISTRAL_API_KEY || '',
    models: ['mistral-large-latest', 'mistral-medium', 'mistral-small'],
    maxTokens: 4000,
    temperature: 0.7,
    fallbackProvider: 'openai'
  },
  openai: {
    name: 'OpenAI',
    apiKey: process.env.OPENAI_API_KEY || '',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    maxTokens: 4000,
    temperature: 0.7,
    fallbackProvider: 'google'
  },
  google: {
    name: 'Google Gemini',
    apiKey: process.env.GOOGLE_API_KEY || '',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
    maxTokens: 4000,
    temperature: 0.7,
    fallbackProvider: 'openrouter'
  },
  openrouter: {
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    models: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o',
      'google/gemini-pro-1.5',
      'meta-llama/llama-3.2-90b-instruct',
      'mistralai/mistral-large'
    ],
    maxTokens: 4000,
    temperature: 0.7,
    fallbackProvider: 'anthropic'
  },
  anthropic: {
    name: 'Anthropic Claude',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    maxTokens: 4000,
    temperature: 0.7,
    fallbackProvider: 'mistral'
  },
  'openai-compatible': {
    name: 'OpenAI-Compatible API',
    baseURL: process.env.OPENAI_COMPATIBLE_BASE_URL || '',
    apiKey: process.env.OPENAI_COMPATIBLE_API_KEY || '',
    models: [process.env.OPENAI_COMPATIBLE_MODEL || 'gpt-3.5-turbo'],
    maxTokens: 4000,
    temperature: 0.7,
    fallbackProvider: 'openai'
  },
  custom: {
    name: 'Custom OpenAI-Compatible',
    baseURL: process.env.CUSTOM_AI_BASE_URL || '',
    apiKey: process.env.CUSTOM_AI_API_KEY || '',
    models: [process.env.CUSTOM_AI_MODEL || 'gpt-3.5-turbo'],
    maxTokens: 4000,
    temperature: 0.7,
    fallbackProvider: 'openai'
  }
};

// Get available providers (only those with API keys)
export function getAvailableProviders(): AIProviders {
  const available: AIProviders = {};
  
  Object.entries(defaultAIProviders).forEach(([key, config]) => {
    if (config.apiKey && config.apiKey.trim() !== '') {
      available[key] = config;
    }
  });
  
  return available;
}

// Get primary provider based on environment configuration
export function getPrimaryProvider(): [string, AIProviderConfig] | null {
  const available = getAvailableProviders();
  
  // Check if AI_PRIMARY_PROVIDER is set in environment
  const envPrimaryProvider = process.env.AI_PRIMARY_PROVIDER;
  
  if (envPrimaryProvider && available[envPrimaryProvider]) {
    return [envPrimaryProvider, available[envPrimaryProvider]];
  }
  
  // Fallback to preferred order if environment variable is not set or provider not available
  const preferredOrder = ['mistral', 'openai', 'google', 'openrouter', 'anthropic', 'openai-compatible', 'custom'];
  
  for (const provider of preferredOrder) {
    if (available[provider]) {
      return [provider, available[provider]];
    }
  }
  
  // Return first available if none of the preferred ones are available
  const entries = Object.entries(available);
  return entries.length > 0 ? entries[0] : null;
}

// Get fallback chain for a provider
export function getFallbackChain(startProvider: string): Array<[string, AIProviderConfig]> {
  const available = getAvailableProviders();
  const chain: Array<[string, AIProviderConfig]> = [];
  const visited = new Set<string>();
  
  // Add the start provider first if available
  if (available[startProvider]) {
    visited.add(startProvider);
    chain.push([startProvider, available[startProvider]]);
  }
  
  // Get fallback providers from environment variable
  const envFallbackProviders = process.env.AI_FALLBACK_PROVIDERS?.split(',') || [];
  
  // Add environment-configured fallback providers
  for (const provider of envFallbackProviders) {
    const trimmedProvider = provider.trim();
    if (available[trimmedProvider] && !visited.has(trimmedProvider)) {
      visited.add(trimmedProvider);
      chain.push([trimmedProvider, available[trimmedProvider]]);
    }
  }
  
  // Follow the traditional fallback chain for any remaining providers
  let currentProvider = startProvider;
  while (currentProvider && available[currentProvider] && !visited.has(currentProvider)) {
    const config = available[currentProvider];
    if (!visited.has(currentProvider)) {
      visited.add(currentProvider);
      chain.push([currentProvider, config]);
    }
    currentProvider = config.fallbackProvider || '';
  }
  
  // Add any remaining available providers as final fallbacks
  Object.entries(available).forEach(([key, config]) => {
    if (!visited.has(key)) {
      chain.push([key, config]);
    }
  });
  
  return chain;
}
