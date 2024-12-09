import { useState, useEffect, RefObject } from 'react';

export const useAutoScroll = (containerRef: RefObject<HTMLDivElement>) => {
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [userScrolledDuringStream, setUserScrolledDuringStream] = useState(false);

  const isNearBottom = () => {
    if (!containerRef.current) return false;
    const container = containerRef.current;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 100;
  };

  const scrollToBottom = (isStreaming: boolean = false) => {
    if (!containerRef.current) return;
    
    if (isStreaming && userScrolledDuringStream) {
      return;
    }

    if (shouldAutoScroll) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const forceScrollToBottom = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
    setShouldAutoScroll(true); // Réactive l'auto-scroll
    setUserScrolledDuringStream(false); // Réinitialise l'état de scroll utilisateur
  };

  useEffect(() => {
    const handleScroll = () => {
      const wasNearBottom = shouldAutoScroll;
      const isNearBottomNow = isNearBottom();
      setShouldAutoScroll(isNearBottomNow);

      // Si l'utilisateur scrolle manuellement vers le haut pendant le streaming
      if (wasNearBottom && !isNearBottomNow) {
        setUserScrolledDuringStream(true);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [containerRef]);

  const resetStreamingState = () => {
    setUserScrolledDuringStream(false);
  };

  return { 
    shouldAutoScroll, 
    scrollToBottom,
    resetStreamingState,
    forceScrollToBottom 
  };
};