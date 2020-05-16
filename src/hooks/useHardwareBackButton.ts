import { useRef, useEffect } from "react";
import { NativeEventSubscription, BackHandler } from "react-native";

export function useHardwareBackButton(onBackButtonPress: () => void) {
  const backHandlerRef = useRef<NativeEventSubscription>();
  useEffect(() => {
    backHandlerRef.current = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        return onBackButtonPress();
      }
    );
    return () => {
      if (backHandlerRef.current) {
        backHandlerRef.current.remove();
      }
    };
  }, [onBackButtonPress]);
}
