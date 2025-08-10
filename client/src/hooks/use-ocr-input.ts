import { useCallback } from 'react';

export function useOcrInput() {
  const process = useCallback(async (_file: File) => {
    console.warn('OCR processing not implemented');
    return '';
  }, []);

  return { process };
}
