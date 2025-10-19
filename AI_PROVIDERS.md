# AI Provider Configuration

This project supports multiple AI providers with automatic fallback functionality. Configure the providers you want to use by setting the appropriate environment variables.

## Required for Basic Functionality

### Mistral AI (Primary)
```bash
MISTRAL_API_KEY=your_mistral_api_key_here
```

## Optional Additional Providers

### OpenAI
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Google Gemini
```bash
GOOGLE_API_KEY=your_google_api_key_here
```

### Anthropic Claude
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### OpenRouter (Access to multiple models through one API)
```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### OpenAI-Compatible APIs
For services like LocalAI, LM Studio, or other OpenAI-compatible APIs:
```bash
OPENAI_COMPATIBLE_BASE_URL=http://localhost:1234/v1
OPENAI_COMPATIBLE_API_KEY=your_api_key_here
OPENAI_COMPATIBLE_MODEL=your_model_name
```

### Custom Provider
For other OpenAI-compatible APIs:
```bash
CUSTOM_AI_BASE_URL=https://your-custom-api.com/v1
CUSTOM_AI_API_KEY=your_custom_api_key_here
CUSTOM_AI_MODEL=your_custom_model_name
```

## Other Environment Variables

### Site Configuration
```bash
NEXT_PUBLIC_SITE_URL=https://your-portfolio-domain.com
```

### GitHub Integration
```bash
GITHUB_TOKEN=your_github_token_here
```

### Analytics
```bash
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## How Fallback Works

The system will automatically try providers in this order:
1. **Mistral** (if configured)
2. **OpenAI** (if configured)
3. **Google** (if configured)
4. **OpenRouter** (if configured)
5. **Anthropic** (if configured)
6. **OpenAI-Compatible** (if configured)
7. **Custom** (if configured)

If one provider fails, the system automatically falls back to the next available provider. This ensures maximum reliability and uptime for your portfolio.

## Setup Instructions

1. Copy `.env.local.example` to `.env.local`
2. Add your API keys for the providers you want to use
3. At minimum, configure **MISTRAL_API_KEY** for basic functionality
4. Add additional providers for better reliability and fallback options

## Provider-Specific Notes

### Mistral AI
- Fastest and most cost-effective option
- Excellent for general conversation and tool calling
- Get API key from: https://console.mistral.ai/

### OpenAI
- High-quality responses
- Wide model selection (GPT-4o, GPT-4o-mini, etc.)
- Get API key from: https://platform.openai.com/

### Google Gemini
- Good for creative tasks
- Free tier available
- Get API key from: https://ai.google.dev/

### OpenRouter
- Access to many models through one API
- Pay-per-use pricing
- Get API key from: https://openrouter.ai/

### Anthropic Claude
- Excellent for complex reasoning
- Safety-focused responses
- Get API key from: https://console.anthropic.com/

### LocalAI / LM Studio
- Run models locally
- No API costs after setup
- Configure using OPENAI_COMPATIBLE_* variables

## Troubleshooting

- Check console logs for provider status information
- Ensure at least one provider is configured
- Verify API keys are valid and have sufficient credits
- Check base URLs for custom providers are accessible
