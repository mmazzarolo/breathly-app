import { impactAsync } from "expo-haptics";
import React, { FC, ReactChild, useState } from "react";
import { Animated, StyleSheet, Platform, ViewStyle } from "react-native";
import { images } from "../../assets/images";
import { Touchable } from "../../common/touchable";
import { deviceHeight } from "../../config/constants";
import { useAppContext } from "../../context/app-context";
import { useOnMount } from "../../hooks/use-on-mount";
import { useOnUpdate } from "../../hooks/use-on-update";
import { Haptics } from "../../services/haptics";
import { animate } from "../../utils/animate";
import { interpolateScale, interpolateTranslateY } from "../../utils/interpolate";
import { StarsBackground } from "../stars-background/stars-background";

export const buttonSize = 60;
export const buttonAnimatorContentHeight = deviceHeight - buttonSize * 2;
const showAnimDuration = 600;
const hideAnimDuration = 300;
const maxExpansionScale = (deviceHeight / buttonSize) * 2;
const expandAnimValDuration = 600;
const expandAnimValFrontTranslateY = 300;

type Props = {
  visible: boolean;
  onHide: () => void;
  onExpandPress: () => void;
  onClosePress: () => void;
  front: ReactChild;
  back: ReactChild;
};

type Status = "showing" | "hiding" | "hidden" | "front" | "back" | "to-front" | "to-back";

export const ButtonAnimator: FC<Props> = ({
  visible,
  onHide,
  onExpandPress,
  onClosePress,
  front,
  back,
}) => {
  const { theme } = useAppContext();
  const [visibilityAnimVal] = useState(new Animated.Value(0));
  const [expandAnimVal] = useState(new Animated.Value(0));
  const [status, setStatus] = useState<Status>("showing");

  const buttonDisabled = status !== "front" && status !== "back";
  const backVisible = status === "back" || status === "to-back" || status === "to-front";
  const backgroundExpanded = status === "back" || status === "to-back";

  const showAnimation = animate(visibilityAnimVal, {
    toValue: 1,
    duration: showAnimDuration,
  });

  const hideAnimation = animate(visibilityAnimVal, {
    toValue: 0,
    duration: hideAnimDuration,
  });

  useOnMount(() => {
    showAnimation.start(() => {
      setStatus("front");
    });
  });

  useOnUpdate((prevVisible) => {
    if (prevVisible && !visible) {
      hideAnimation.start(() => {
        setStatus("hidden");
        onHide();
      });
    }
  }, visible);

  const handlePress = () => {
    if (Platform.OS === "ios") {
      impactAsync();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (status === "front") {
      onExpandPress();
    } else {
      onClosePress();
    }
    setStatus((prevStatus) => (prevStatus === "front" ? "to-back" : "to-front"));
    animate(expandAnimVal, {
      toValue: status === "front" || status === "to-back" ? 1 : 0,
      duration: expandAnimValDuration,
    }).start(() => {
      setStatus((prevStatus) => (prevStatus === "to-front" ? "front" : "back"));
    });
  };
  const underlayAnimatedStyle = {
    opacity: visibilityAnimVal.interpolate({
      inputRange: [0.99, 1],
      outputRange: [0, 1],
    }),
    transform: [
      interpolateScale(expandAnimVal, {
        inputRange: [0, 1],
        outputRange: [1, Math.ceil(maxExpansionScale)],
      }),
    ],
  };
  const underlayChildrenAnimatedStyle = {
    opacity: expandAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      interpolateTranslateY(expandAnimVal, {
        inputRange: [0, 1],
        outputRange: [expandAnimValFrontTranslateY, 0],
      }),
    ],
  };
  const inactiveIconAnimatedStyle = {
    opacity: expandAnimVal.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [1, 0, 0],
    }),
  };
  const activeButtonAnimatedStyle = {
    opacity: expandAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      interpolateScale(expandAnimVal, {
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    ],
  };
  const inactiveButtonAnimatedStyle = {
    opacity: visibilityAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      interpolateScale(visibilityAnimVal, {
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    ],
  };
  const animatedFrontStyle: Animated.WithAnimatedObject<ViewStyle> = {
    opacity: visibilityAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      interpolateTranslateY(visibilityAnimVal, {
        inputRange: [0, 1],
        outputRange: [30, 0],
      }),
    ],
  };

  return (
    <>
      <Animated.View style={animatedFrontStyle}>{front}</Animated.View>
      <Animated.View style={styles.buttonContainer}>
        <Animated.View
          style={[styles.underlay, underlayAnimatedStyle, { backgroundColor: theme.mainColor }]}
        />
        <Touchable
          testID="exercise-button-start"
          onPress={handlePress}
          disabled={buttonDisabled}
          style={{ position: "absolute", zIndex: 2 }}
        >
          <Animated.View
            style={[
              styles.button,
              styles.buttonInactive,
              inactiveButtonAnimatedStyle,
              { backgroundColor: theme.mainColor },
            ]}
          >
            <Animated.Image
              source={images.iconPlay}
              style={[styles.icon, inactiveIconAnimatedStyle, { tintColor: "white" }]}
            />
          </Animated.View>
        </Touchable>
        <Touchable
          testID="exercise-button-stop"
          onPress={handlePress}
          disabled={buttonDisabled}
          style={styles.stopButtonTouchable}
        >
          <Animated.View
            style={[
              styles.button,
              styles.buttonActive,
              activeButtonAnimatedStyle,
              styles.stopButton,
            ]}
          >
            <Animated.Image
              source={images.iconClose}
              style={[styles.icon, { tintColor: theme.mainColor }]}
            />
          </Animated.View>
        </Touchable>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[styles.underlayChildren, underlayChildrenAnimatedStyle]}
      >
        {backVisible && back}
      </Animated.View>
      <StarsBackground expanded={backgroundExpanded} animationDuration={expandAnimValDuration} />
    </>
  );
};

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    height: buttonSize,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    bottom: 0,
    marginBottom: buttonSize / 2,
  },
  underlay: {
    position: "absolute",
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    justifyContent: "center",
    alignItems: "center",
    ...shadowStyle,
  },
  underlayChildren: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  backContainer: {},
  button: {
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonActive: {
    ...shadowStyle,
  },
  buttonInactive: {},
  stopButtonTouchable: {
    position: "absolute",
    zIndex: 2,
  },
  stopButton: {
    backgroundColor: "white",
  },
  icon: {
    width: buttonSize / 3,
    height: buttonSize / 3,
  },
});
