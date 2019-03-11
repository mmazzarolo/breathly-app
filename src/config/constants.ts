import { Dimensions, StatusBar } from "react-native";

const { width, height } = Dimensions.get("screen");

export const androidNavBarHeight = 48;
export const androidStatusBarHeight = StatusBar.currentHeight || 24;

export const deviceWidth = width;
export const deviceHeight = height;
