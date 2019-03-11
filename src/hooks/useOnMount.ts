import { useEffect } from "react";

type EffectCallback = () => void | (() => void);

export function useOnMount(onMount: EffectCallback) {
  useEffect(onMount, []);
}
