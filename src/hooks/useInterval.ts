import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, interval: number = 1000) {
  const callbackRef = useRef<any>(null);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const tick = () => {
      callbackRef.current && callbackRef.current();
    };

    let id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval]);
}
