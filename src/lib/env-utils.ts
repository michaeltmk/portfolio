import { getEnvironmentConfig } from './config';

/**
 * Utility functions for accessing environment configuration
 */

// Get the current site URL (useful for metadata, Open Graph, etc.)
export function getSiteUrl(): string {
  const env = getEnvironmentConfig();
  return env.siteUrl;
}

// Get GitHub token for API calls
export function getGitHubToken(): string {
  const env = getEnvironmentConfig();
  return env.githubToken;
}

// Get Google Analytics ID
export function getGoogleAnalyticsId(): string {
  const env = getEnvironmentConfig();
  return env.googleAnalyticsId;
}

// Get AI provider configuration
export function getAIProviderConfig() {
  const env = getEnvironmentConfig();
  return {
    primary: env.aiPrimaryProvider,
    fallback: env.aiFallbackProviders,
  };
}

// Check if we're in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Check if analytics should be enabled
export function shouldEnableAnalytics(): boolean {
  return isProduction() && !!getGoogleAnalyticsId();
}
