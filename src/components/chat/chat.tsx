'use client';
import { useChat, type Message } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useContactInfo } from '@/lib/portfolio-context';

// Component imports
import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import ChatMessageContent from '@/components/chat/chat-message-content';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';
import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import WelcomeModal from '@/components/welcome-modal';
import { Info } from 'lucide-react';
import { GithubButton } from '../ui/github-button';
import HelperBoost from './HelperBoost';

// ClientOnly component for client-side rendering
//@ts-ignore
const ClientOnly = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

// Define Avatar component props interface
interface AvatarProps {
  hasActiveTool: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isTalking: boolean;
}

// Dynamic import of Avatar component
const Avatar = dynamic<AvatarProps>(
  () =>
    Promise.resolve(({ hasActiveTool, videoRef, isTalking }: AvatarProps) => {
      // This function will only execute on the client
      const isIOS = () => {
        // Multiple detection methods
        const userAgent = window.navigator.userAgent;
        const platform = window.navigator.platform;
        const maxTouchPoints = window.navigator.maxTouchPoints || 0;

        // UserAgent-based check
        const isIOSByUA =
          //@ts-ignore
          /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

        // Platform-based check
        const isIOSByPlatform = /iPad|iPhone|iPod/.test(platform);

        // iPad Pro check
        const isIPadOS =
          //@ts-ignore
          platform === 'MacIntel' && maxTouchPoints > 1 && !window.MSStream;

        // Safari check
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

        return isIOSByUA || isIOSByPlatform || isIPadOS || isSafari;
      };

      // Conditional rendering based on detection
      return (
        <div
          className={`flex items-center justify-center rounded-full transition-all duration-300 ${hasActiveTool ? 'h-20 w-20' : 'h-28 w-28'}`}
        >
          <div
            className="relative cursor-pointer"
            onClick={() => (window.location.href = '/')}
          >
            {isIOS() ? (
              <img
                src="/landing-memojis.png"
                alt="iOS avatar"
                className="h-full w-full scale-[1.8] object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                className="h-full w-full scale-[1.8] object-contain"
                muted
                playsInline
                loop
              >
                <source src="/final_memojis.webm" type="video/webm" />
                <source src="/final_memojis_ios.mp4" type="video/mp4" />
              </video>
            )}
          </div>
        </div>
      );
    }),
  { ssr: false }
);

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
    ease: 'easeOut',
  },
};

const Chat = () => {
  const contactInfo = useContactInfo();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [fallbackNumber, setFallbackNumber] = useState(0); // 0 = primary, 1+ = fallback providers
  const [responseTimeoutId, setResponseTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [isRetrying, setIsRetrying] = useState(false); // Prevent multiple simultaneous retries
  
  // Track pending submissions to prevent duplicates
  const pendingSubmissionsRef = useRef(new Set<string>());
  
  // Track current fallback number for immediate access in callbacks
  const fallbackNumberRef = useRef(0);
  
  // Sync ref with state changes
  useEffect(() => {
    fallbackNumberRef.current = fallbackNumber;
    console.log(`[CHAT-CLIENT] Fallback number updated: state=${fallbackNumber}, ref=${fallbackNumberRef.current}`);
  }, [fallbackNumber]);

  // Helper function to check if we should try fallback (simplified - fallback for any error)
  const shouldTriggerFallback = (error: Error): boolean => {
    // Only skip fallback for specific conversation format errors that need special handling
    if (error.message?.includes('role') && (error.message?.includes('user') || error.message?.includes('tool'))) {
      console.log('Conversation format error - not triggering fallback, needs conversation reset');
      return false;
    }
    
    // For any other error, try fallback
    console.log('Error detected, will try fallback:', error.message);
    return true;
  };

  // Helper function to handle provider errors and trigger fallback
  const handleProviderError = (error: Error) => {
    console.log('[CHAT-CLIENT] Handling provider error:', error.message);
    
    // Prevent multiple simultaneous retries
    if (isRetrying) {
      console.log('[CHAT-CLIENT] Already retrying, skipping duplicate error handling');
      return false;
    }
    
    // Try fallback for ANY error (except conversation format errors which are handled separately)
    const maxFallbacks = 3;
    const currentFallback = fallbackNumberRef.current;
    
    if (currentFallback < maxFallbacks) {
      const nextFallback = currentFallback + 1;
      console.log(`Auto-retrying with fallback provider #${nextFallback} (current was ${currentFallback})`);
      console.log(`Error that triggered fallback: ${error.message}`);
      
      setIsRetrying(true);
      
      // Update both state and ref
      setFallbackNumber(nextFallback);
      fallbackNumberRef.current = nextFallback;
      
      // Retry the last user message with the new provider
      const lastUserMessage = messages.findLast(m => m.role === 'user');
      if (lastUserMessage) {
        setTimeout(() => {
          console.log(`Re-submitting with fallback_number: ${nextFallback}`);
          console.log('Current messages before retry:', messages.map(m => ({ role: m.role, content: m.content?.substring(0, 50) })));
          
          // Remove any failed assistant messages and ensure we have a clean user message
          const filteredMessages = messages.filter(m => {
            // Keep all user messages and successful assistant messages
            return m.role === 'user' || (m.role === 'assistant' && m.content && m.content.trim() !== '');
          });
          
          console.log('Filtered messages for retry:', filteredMessages.map(m => ({ role: m.role, content: m.content?.substring(0, 50) })));
          
          // Set the filtered messages and trigger reload
          setMessages(filteredMessages);
          
          // Use reload to trigger a fresh request with the updated fallback number
          setTimeout(() => {
            console.log(`Calling reload() with fallbackNumberRef.current: ${fallbackNumberRef.current}`);
            reload();
          }, 100);
          
          setIsRetrying(false);
        }, 1500); // Slightly longer delay to ensure state update
      } else {
        setIsRetrying(false);
      }
      return true; // Indicates fallback was triggered
    } else {
      console.log('All fallback providers exhausted');
      setFallbackNumber(0); // Reset for next conversation
      fallbackNumberRef.current = 0;
      setIsRetrying(false);
      toast.error('All AI providers are currently experiencing issues. Please try again later.');
      return false;
    }
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    setInput,
    reload,
    addToolResult,
    append,
  } = useChat({
    api: '/api/chat',
    body: {
      fallback_number: fallbackNumberRef.current,
    },
    onResponse: async (response) => {
      console.log(`[CHAT-CLIENT] Response received with fallback_number: ${fallbackNumberRef.current}`);
      console.log(`[CHAT-CLIENT] Response status: ${response.status}`);
      console.log(`[CHAT-CLIENT] Response headers:`, Object.fromEntries(response.headers.entries()));
      
      // Clear any existing timeout
      if (responseTimeoutId) {
        clearTimeout(responseTimeoutId);
        setResponseTimeoutId(null);
      }
      
      if (response) {
        // Check if response is actually an error disguised as 200
        if (response.status >= 400) {
          console.log(`[CHAT-CLIENT] Error response detected: ${response.status}`);
          return; // Let onError handle it
        }
        
        // Check response content type to ensure it's the expected format
        const contentType = response.headers.get('content-type');
        console.log(`[CHAT-CLIENT] Content-Type: ${contentType}`);
        
        // For streaming responses, we expect text/plain with AI data stream
        const isValidStreamFormat = contentType?.includes('text/plain') && 
                                   response.headers.get('X-Vercel-AI-Data-Stream');
        
        if (!isValidStreamFormat) {
          console.warn(`[CHAT-CLIENT] Unexpected response format. Content-Type: ${contentType}`);
          
          // Try to read the response body to check for errors
          try {
            const responseClone = response.clone();
            const text = await responseClone.text();
            console.log(`[CHAT-CLIENT] Response body preview:`, text.substring(0, 200));
            
            // Check if it's actually an error response or empty/malformed
            if (text.includes('error') || text.includes('Error') || text.length < 10) {
              console.log('[CHAT-CLIENT] Detected malformed response, triggering fallback');
              
              // Manually trigger the error handling
              const artificialError = new Error(`Invalid response format from provider. Content-Type: ${contentType}, Body: ${text.substring(0, 100)}`);
              (artificialError as any).status = 502; // Bad Gateway - provider returned invalid format
              
              // Call the error handler manually
              setTimeout(() => {
                handleProviderError(artificialError);
              }, 100);
              return;
            }
          } catch (readError) {
            console.error('[CHAT-CLIENT] Could not read response body:', readError);
          }
        }
        
        // Set up a timeout to detect hanging responses
        const timeoutId = setTimeout(() => {
          console.log('[CHAT-CLIENT] Response timeout detected - no content received within 30 seconds');
          const timeoutError = new Error('Response timeout - provider is not responding');
          (timeoutError as any).status = 504; // Gateway Timeout
          handleProviderError(timeoutError);
        }, 30000); // 30 second timeout
        
        setResponseTimeoutId(timeoutId);
        
        setLoadingSubmit(false);
        setIsTalking(true);
        if (videoRef.current) {
          videoRef.current.play().catch((error) => {
            console.error('Failed to play video:', error);
          });
        }
      }
    },
    onFinish: (message) => {
      console.log('[CHAT-CLIENT] Message finished:', message);
      
      // Clear any response timeout
      if (responseTimeoutId) {
        clearTimeout(responseTimeoutId);
        setResponseTimeoutId(null);
      }
      
      setLoadingSubmit(false);
      setIsTalking(false);
      // Clear pending submissions when finished
      pendingSubmissionsRef.current.clear();
      
      // Check if the message is actually empty or malformed
      if (!message || !message.content || message.content.trim() === '') {
        console.warn('[CHAT-CLIENT] Received empty or malformed message on finish');
        
        // Only trigger fallback if we're not already retrying and haven't exhausted fallbacks
        if (!isRetrying && fallbackNumberRef.current < 3) {
          const emptyResponseError = new Error('Provider returned empty response');
          (emptyResponseError as any).status = 502;
          
          // Don't reset fallback number yet, trigger fallback first
          setTimeout(() => {
            handleProviderError(emptyResponseError);
          }, 500);
        } else {
          console.log('[CHAT-CLIENT] Skipping fallback for empty response - already retrying or exhausted');
        }
        return;
      }
      
      // Only reset fallback number on successful completion with content
      setFallbackNumber(0);
      fallbackNumberRef.current = 0;
      setIsRetrying(false); // Reset retry flag on success
      
      if (videoRef.current) {
        videoRef.current.pause();
      }
    },
    onError: (error) => {
      setLoadingSubmit(false);
      setIsTalking(false);
      
      // Clear any response timeout
      if (responseTimeoutId) {
        clearTimeout(responseTimeoutId);
        setResponseTimeoutId(null);
      }
      
      // Clear pending submissions on error
      pendingSubmissionsRef.current.clear();
      if (videoRef.current) {
        videoRef.current.pause();
      }
      
      // Enhanced client-side error logging
      console.error('Chat error:', error.message, error.cause);
      console.error('Full error object:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
        status: (error as any).status,
        statusCode: (error as any).statusCode,
        code: (error as any).code,
        timestamp: new Date().toISOString()
      });
      
      // Log additional context if available
      if (error.cause && typeof error.cause === 'object') {
        console.error('Error cause details:', error.cause);
      }
      
      // Log current fallback state for debugging
      console.log('Current fallback state:', {
        fallbackNumber,
        maxFallbacks: 3,
        canRetry: fallbackNumber < 3
      });
      
      // Handle conversation format errors separately (don't trigger fallback)
      if (error.message?.includes('role') && (error.message?.includes('user') || error.message?.includes('tool'))) {
        toast.error('There was an issue with the conversation format. Starting fresh...');
        // Clear the conversation to start fresh
        setTimeout(() => {
          setMessages([]);
        }, 2000);
        return;
      }
      
      // Handle authentication errors (don't trigger fallback)
      if (error.message?.includes('authentication') || error.message?.includes('API key')) {
        toast.error('AI service configuration issue. Please contact support if this persists.');
        return;
      }
      
      // Use the centralized error handler for all other errors
      const fallbackTriggered = handleProviderError(error);
      
      // If no fallback was triggered, handle conversation format errors
      if (!fallbackTriggered && error.message?.includes('conversation format')) {
        console.log('Attempting to recover from conversation format error...');
        setTimeout(() => {
          // Keep only the last user message and retry
          const lastUserMessage = messages.findLast(m => m.role === 'user');
          if (lastUserMessage) {
            setMessages([lastUserMessage]);
          }
        }, 3000);
      }
    },
    onToolCall: (tool) => {
      const toolName = tool.toolCall.toolName;
      console.log('Tool call:', toolName);
    },
  });

  const { currentAIMessage, latestUserMessage, hasActiveTool } = useMemo(() => {
    const latestAIMessageIndex = messages.findLastIndex(
      (m) => m.role === 'assistant'
    );
    const latestUserMessageIndex = messages.findLastIndex(
      (m) => m.role === 'user'
    );

    const result = {
      currentAIMessage:
        latestAIMessageIndex !== -1 ? messages[latestAIMessageIndex] : null,
      latestUserMessage:
        latestUserMessageIndex !== -1 ? messages[latestUserMessageIndex] : null,
      hasActiveTool: false,
    };

    if (result.currentAIMessage) {
      result.hasActiveTool =
        result.currentAIMessage.parts?.some(
          (part) =>
            part.type === 'tool-invocation' &&
            part.toolInvocation?.state === 'result'
        ) || false;
    }

    if (latestAIMessageIndex < latestUserMessageIndex) {
      result.currentAIMessage = null;
    }

    return result;
  }, [messages]);

  const isToolInProgress = messages.some(
    (m) =>
      m.role === 'assistant' &&
      m.parts?.some(
        (part) =>
          part.type === 'tool-invocation' &&
          part.toolInvocation?.state !== 'result'
      )
  );

  //@ts-ignore
  const submitQuery = (query, retryCount = 0) => {
    if (!query.trim() || isToolInProgress) return;
    
    const trimmedQuery = query.trim();
    const maxRetries = 2;
    
    // Check if this exact query is already being processed
    if (loadingSubmit || pendingSubmissionsRef.current.has(trimmedQuery)) {
      console.log('Duplicate submission prevented for:', trimmedQuery);
      return;
    }
    
    // Mark this query as pending
    pendingSubmissionsRef.current.add(trimmedQuery);
    setLoadingSubmit(true);
    
    console.log(`Submitting query (attempt ${retryCount + 1}):`, trimmedQuery);
    
    // Clear this specific query from pending after 30 seconds as failsafe
    const timeoutId = setTimeout(() => {
      pendingSubmissionsRef.current.delete(trimmedQuery);
    }, 30000);
    
    try {
      append({
        role: 'user',
        content: query,
      });
    } catch (error: any) {
      console.error('Error submitting query:', error);
      pendingSubmissionsRef.current.delete(trimmedQuery);
      clearTimeout(timeoutId);
      setLoadingSubmit(false);
      
      // Retry logic for certain types of errors
      if (retryCount < maxRetries && 
          (error.message?.includes('role') || error.message?.includes('conversation'))) {
        console.log(`Retrying query after error (attempt ${retryCount + 2}/${maxRetries + 1})`);
        setTimeout(() => {
          submitQuery(query, retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        toast.error(`Failed to submit query: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.pause();
    }

    // Only submit initial query once
    if (initialQuery && !autoSubmitted && !loadingSubmit) {
      setAutoSubmitted(true);
      setInput('');
      submitQuery(initialQuery);
    }
  }, [initialQuery, autoSubmitted, loadingSubmit]);

  useEffect(() => {
    if (videoRef.current) {
      if (isTalking) {
        videoRef.current.play().catch((error) => {
          console.error('Failed to play video:', error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isTalking]);

  //@ts-ignore
  const onSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isToolInProgress) return;
    submitQuery(input);
    setInput('');
  };

  const handleStop = () => {
    stop();
    setLoadingSubmit(false);
    setIsTalking(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Check if this is the initial empty state (no messages)
  const isEmptyState =
    !currentAIMessage && !latestUserMessage && !loadingSubmit;

  // Calculate header height based on hasActiveTool
  const headerHeight = hasActiveTool ? 100 : 180;

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="absolute top-6 right-8 z-51 flex flex-col-reverse items-center justify-center gap-1 md:flex-row">
        <WelcomeModal
          trigger={
            <div className="hover:bg-accent cursor-pointer rounded-2xl px-3 py-1.5">
              <Info className="text-accent-foreground h-8" />
            </div>
          }
        />
        <div className="">
          <GithubButton
            animationDuration={1.5}
            label="Star"
            size={'sm'}
            repoUrl="https://github.com/michaeltmk"
          />
        </div>
      </div>

      {/* Fixed Avatar Header with Gradient */}
      <div
        className="fixed top-0 right-0 left-0 z-50 bg-gradient-to-b from-white via-white/95 via-50% to-transparent dark:from-black dark:via-black/95 dark:via-50% dark:to-transparent"
      >
        <div
          className={`transition-all duration-300 ease-in-out ${hasActiveTool ? 'pt-6 pb-0' : 'py-6'}`}
        >
          <div className="flex justify-center">
            <ClientOnly>
              <Avatar
                hasActiveTool={hasActiveTool}
                videoRef={videoRef}
                isTalking={isTalking}
              />
            </ClientOnly>
          </div>

          <AnimatePresence>
            {latestUserMessage && !currentAIMessage && (
              <motion.div
                {...MOTION_CONFIG}
                className="mx-auto flex max-w-3xl px-4"
              >
                <ChatBubble variant="sent">
                  <ChatBubbleMessage>
                    <ChatMessageContent
                      message={latestUserMessage}
                      isLast={true}
                      isLoading={false}
                      reload={() => Promise.resolve(null)}
                    />
                  </ChatBubbleMessage>
                </ChatBubble>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto flex h-full max-w-3xl flex-col">
        {/* Scrollable Chat Content */}
        <div
          className="flex-1 overflow-y-auto px-2"
          style={{ paddingTop: `${headerHeight}px` }}
        >
          <AnimatePresence mode="wait">
            {isEmptyState ? (
              <motion.div
                key="landing"
                className="flex min-h-full items-center justify-center"
                {...MOTION_CONFIG}
              >
                <ChatLanding submitQuery={submitQuery} />
              </motion.div>
            ) : currentAIMessage ? (
              <div className="pb-4">
                <SimplifiedChatView
                  message={currentAIMessage}
                  isLoading={isLoading}
                  reload={reload}
                  addToolResult={addToolResult}
                />
              </div>
            ) : (
              loadingSubmit && (
                <motion.div
                  key="loading"
                  {...MOTION_CONFIG}
                  className="px-4 pt-18"
                >
                  <ChatBubble variant="received">
                    <ChatBubbleMessage isLoading />
                  </ChatBubble>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

{/* Fixed Bottom Bar */}
<div
  className="sticky bottom-0 px-2 pt-3 md:px-0 md:pb-4 transition-colors duration-300 bg-white dark:bg-black"
>
  <div className="relative flex flex-col items-center gap-3">
    <HelperBoost submitQuery={submitQuery} setInput={setInput} />
    <ChatBottombar
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={onSubmit}
      isLoading={isLoading}
      stop={handleStop}
      isToolInProgress={isToolInProgress}
    />
  </div>
</div>

        <a
          href={contactInfo.social.linkedin.url}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-3 bottom-0 z-10 mb-4 hidden cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm hover:underline md:block"
        >
          @{contactInfo.social.linkedin.username}
        </a>
      </div>
    </div>
  );
};

export default Chat;
