import React, { FC } from "react";
import { Animated, StyleSheet } from "react-native";
import { images } from "../../config/images";
import { useAppContext } from "../../context/AppContext";
import { buttonAnimatorContentHeight } from "../ButtonAnimator/ButtonAnimator";
import { MenuButton } from "./MenuButton";
import { MenuLogo } from "./MenuLogo";

interface Props {
  onTechniquePickerPress: () => void;
  onSettingsPress: () => void;
}

export const Menu: FC<Props> = ({
  onTechniquePickerPress,
  onSettingsPress
}) => {
  const { technique, theme } = useAppContext();
  return (
    <>
      <Animated.View style={styles.buttons}>
        <MenuButton
          imageSource={images.iconSettings}
          label="Settings"
          onPress={onSettingsPress}
        />
        <MenuButton
          imageSource={images.iconMeditation}
          label={`${technique.name}\nbreathing`}
          onPress={onTechniquePickerPress}
        />
      </Animated.View>
      <Animated.View style={styles.container}>
        <MenuLogo color={theme.mainColor} />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: buttonAnimatorContentHeight,
    justifyContent: "center",
    alignItems: "center"
  },
  buttons: {
    position: "absolute",
    alignItems: "flex-end",
    right: 20,
    top: 26,
    zIndex: 20
  }
});
