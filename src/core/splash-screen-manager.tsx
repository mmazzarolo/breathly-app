import * as SplashScreen from "expo-splash-screen";
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import {
  getRemainingSplashDurationMs,
  maximumSplashWaitMs,
} from "@breathly/core/splash-screen-timing";
import { useHomeScreenStatusStore } from "@breathly/screens/home-screen/home-screen";

if (Platform.OS !== "web") {
  // This must run before React mounts so native startup remains covered while JS initializes.
  void SplashScreen.preventAutoHideAsync().catch(() => undefined);
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const splashImageAsset = require("../../assets/splash.png");

const splashBackgroundColor = "#F2F2F1";

export const SplashScreenManager: React.FC<PropsWithChildren> = ({ children }) => {
  if (Platform.OS === "web") return <>{children}</>;
  return <NativeSplashScreenManager>{children}</NativeSplashScreenManager>;
};

const NativeSplashScreenManager: React.FC<PropsWithChildren> = ({ children }) => {
  const mountedAtMs = useRef(Date.now()).current;
  const opacity = useMemo(() => new Animated.Value(1), []);
  const isHomeScreenReady = useHomeScreenStatusStore((state) => state.isHomeScreenReady);
  const [isOverlayReady, setOverlayReady] = useState(false);
  const [isSplashComplete, setSplashComplete] = useState(false);
  const nativeHideRequested = useRef(false);
  const revealRequested = useRef(false);
  const revealTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const hideNativeSplash = useCallback(() => {
    if (nativeHideRequested.current) return;
    nativeHideRequested.current = true;
    void SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  const revealApp = useCallback(() => {
    if (revealRequested.current) return;
    revealRequested.current = true;
    hideNativeSplash();

    const remainingDurationMs = getRemainingSplashDurationMs(mountedAtMs, Date.now());
    revealTimeout.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.quad),
      }).start(({ finished }) => {
        if (finished) setSplashComplete(true);
      });
    }, remainingDurationMs);
  }, [hideNativeSplash, mountedAtMs, opacity]);

  const handleOverlaySettled = useCallback(() => {
    setOverlayReady(true);
    hideNativeSplash();
  }, [hideNativeSplash]);

  useEffect(() => {
    if (isOverlayReady && isHomeScreenReady) revealApp();
  }, [isHomeScreenReady, isOverlayReady, revealApp]);

  useEffect(() => {
    const watchdog = setTimeout(revealApp, maximumSplashWaitMs);
    return () => {
      clearTimeout(watchdog);
      if (revealTimeout.current) clearTimeout(revealTimeout.current);
      opacity.stopAnimation();
    };
  }, [opacity, revealApp]);

  return (
    <View style={styles.container}>
      {children}
      {!isSplashComplete && (
        <Animated.View
          pointerEvents="none"
          style={[styles.overlay, { opacity }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Animated.Image
            style={styles.image}
            source={splashImageAsset}
            resizeMode="cover"
            onLoadEnd={handleOverlaySettled}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: splashBackgroundColor,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
