import { Asset } from "expo-asset";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import ms from "ms";
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { useHomeScreenStatusStore } from "@breathly/screens/home-screen/home-screen";
import { delay } from "@breathly/utils/delay";

// Instruct SplashScreen not to hide yet, we want to do this manually
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const splashImageAsset = require("../../assets/splash.png");

// Force the splash-screen to stay visible for a bit to avoid jarring visuals
const waitBeforeHide = ms("1.5 sec");

export const SplashScreenManager: React.FC<PropsWithChildren> = ({ children }) => {
  const [isSplashReady, setSplashReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await Asset.fromModule(splashImageAsset).downloadAsync();
      setSplashReady(true);
    }

    prepare();
  }, []);

  if (!isSplashReady) {
    return null;
  }

  return <AnimatedSplashScreen>{children}</AnimatedSplashScreen>;
};

const AnimatedSplashScreen: React.FC<PropsWithChildren> = ({ children }) => {
  const mountTime = useRef(Date.now()).current;
  const animation = useMemo(() => new Animated.Value(1), []);
  const [isAppReady, setAppReady] = useState(false);
  const { isHomeScreenReady } = useHomeScreenStatusStore();
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

  const showApp = async () => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - mountTime;
    const remainingTime = elapsedTime > waitBeforeHide ? 0 : waitBeforeHide - elapsedTime;
    if (remainingTime > 0) {
      await delay(remainingTime);
    }
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.quad),
    }).start(() => setAnimationComplete(true));
  };

  useEffect(() => {
    if (isAppReady && isHomeScreenReady) {
      showApp();
    }
  }, [isAppReady, isHomeScreenReady]);

  const onImageLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
      // Load stuff
      await Promise.all([]);
    } catch (e) {
      // handle errors
    } finally {
      setAppReady(true);
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {isAppReady && children}
      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Constants.manifest.splash.backgroundColor,
              opacity: animation,
            },
          ]}
        >
          <Animated.Image
            style={{
              width: "100%",
              height: "100%",
              resizeMode: Constants.manifest.splash.resizeMode || "contain",
            }}
            source={splashImageAsset}
            onLoadEnd={onImageLoaded}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </View>
  );
};
