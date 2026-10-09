import { useCallback, useEffect, useState } from 'react';

export function errorMessage(err) {
  return err?.response?.data?.error || err?.message || 'Request failed';
}

/**
 * Runs `request()` whenever `key` changes (or `reload()` is called) and tracks
 * loading and error state. A response that arrives after the key has changed
 * is ignored, so switching projects quickly never shows another project's data.
 * Pass key = null to skip the request.
 */
export default function useApi(request, key) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ id: null, data: null, error: null });
  const id = key == null ? null : `${key}::${version}`;

  useEffect(() => {
    if (id == null) return undefined;
    let active = true;
    request().then(
      (data) => {
        if (active) setResult({ id, data, error: null });
      },
      (err) => {
        if (active) setResult({ id, data: null, error: errorMessage(err) });
      },
    );
    return () => {
      active = false;
    };
    // `request` is a new function on every render; `id` already captures what it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const current = id != null && result.id === id;

  return {
    data: current ? result.data : null,
    error: current ? result.error : null,
    loading: id != null && !current,
    // Last data received, even if it belongs to an older key (useful to avoid layout jumps).
    previousData: result.data,
    reload,
  };
}
