import { useState, useEffect } from 'react';

interface ProviderStatus {
  status: 'healthy' | 'error' | 'loading';
  timestamp?: string;
  providers: {
    primary: {
      key: string;
      name: string;
      hasApiKey: boolean;
    } | null;
    availableCount: number;
    fallbackChain: Array<{
      key: string;
      name: string;
      hasApiKey: boolean;
    }>;
  };
  error?: string;
}

export function useProviderStatus() {
  const [status, setStatus] = useState<ProviderStatus>({
    status: 'loading',
    providers: {
      primary: null,
      availableCount: 0,
      fallbackChain: []
    }
  });

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        providers: {
          primary: null,
          availableCount: 0,
          fallbackChain: []
        }
      });
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Check status every 5 minutes
    const interval = setInterval(checkStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { status, refresh: checkStatus };
}
