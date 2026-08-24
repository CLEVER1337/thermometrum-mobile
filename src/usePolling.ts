import { useCallback, useEffect, useState } from 'react';

const defaultInterval = 30000;

export type Polling<T> = {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function usePolling<T>(load: () => Promise<T>, intervalMs = defaultInterval): Polling<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    try {
      setData(await load());
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    run();
    const timer = setInterval(run, intervalMs);
    return () => clearInterval(timer);
  }, [run, intervalMs]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await run();
    setRefreshing(false);
  }, [run]);

  return { data, loading, refreshing, error, refresh };
}
