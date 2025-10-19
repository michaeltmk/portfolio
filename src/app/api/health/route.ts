import { getProviderStatus } from '@/lib/ai-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const status = getProviderStatus();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      providers: {
        primary: status.primary ? {
          key: status.primary[0],
          name: status.primary[1]?.name,
          hasApiKey: Boolean(status.primary[1]?.apiKey)
        } : null,
        availableCount: status.availableProviders,
        fallbackChain: status.fallbackChain
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      providers: {
        primary: null,
        availableCount: 0,
        fallbackChain: []
      }
    }, { status: 500 });
  }
}
