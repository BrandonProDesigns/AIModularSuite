import { useCallback } from 'react';

export function useVoiceInput() {
  const start = useCallback(async () => {
    console.warn('Voice input not implemented');
    return '';
  }, []);

  return { start };
}
