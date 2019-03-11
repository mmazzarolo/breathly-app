import { Platform } from "react-native";

const buildImageSource = (
  iosSrc: string,
  androidSrc: string
): { uri: string } => {
  return { uri: Platform.OS === "ios" ? iosSrc : androidSrc };
};

export const images = {
  iconClose: buildImageSource("IconClose", "icon_close"),
  iconLeftArrow: buildImageSource("IconLeftArrow", "icon_left_arrow"),
  iconMeditation: buildImageSource("IconMeditation", "icon_meditation"),
  iconPlay: buildImageSource("IconPlay", "icon_play"),
  iconSettings: buildImageSource("IconSettings", "icon_settings"),
  logo: buildImageSource("Logo", "logo"),
  starsBackground: buildImageSource("StarsBackground", "background_stars")
};
