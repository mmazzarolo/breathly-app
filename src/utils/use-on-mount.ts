import { useEffect, useRef } from "react";

type EffectCallback = () => void | (() => void);

export function useOnMount(onMount: EffectCallback) {
  const onMountRef = useRef(onMount);
  useEffect(() => onMountRef.current(), []);
}
