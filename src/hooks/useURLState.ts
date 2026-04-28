import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

/**
 * Hook for managing state in URL search parameters
 * 
 * Standardizes pagination, filters, and sorting so links are shareable.
 */
export function useURLState<T extends Record<string, string | number | boolean>>(
  defaultValues: T
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(() => {
    const current: any = { ...defaultValues };
    
    for (const key in defaultValues) {
      const val = searchParams.get(key);
      if (val !== null) {
        if (typeof defaultValues[key] === 'number') {
          current[key] = Number(val);
        } else if (typeof defaultValues[key] === 'boolean') {
          current[key] = val === 'true';
        } else {
          current[key] = val;
        }
      }
    }
    
    return current as T;
  }, [searchParams, defaultValues]);

  const updateState = useCallback(
    (updates: Partial<T>) => {
      const newParams = new URLSearchParams(searchParams);
      
      for (const key in updates) {
        const val = updates[key];
        if (val === undefined || val === null || val === defaultValues[key]) {
          newParams.delete(key);
        } else {
          newParams.set(key, String(val));
        }
      }
      
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams, defaultValues]
  );

  return [state, updateState] as const;
}
