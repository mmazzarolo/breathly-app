import { Platform } from "react-native";

interface Font {
  fontWeight: "200" | "300";
  fontFamily: string | undefined;
}

export const fontThin: Font = {
  fontWeight: "200",
  fontFamily: Platform.OS === "android" ? "sans-serif-thin" : undefined
};

export const fontLight: Font = {
  fontWeight: "300",
  fontFamily: Platform.OS === "android" ? "sans-serif-light" : undefined
};

export const fontMono: Font = {
  fontWeight: "200",
  fontFamily:
    Platform.OS === "android" ? "sans-serif-thin" : "HelveticaNeue-Light"
};
