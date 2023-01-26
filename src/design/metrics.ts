import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("screen");

export const deviceWidth = width;
export const deviceHeight = height;
export const shortestDeviceDimension = deviceHeight > deviceWidth ? deviceWidth : deviceHeight;
export const widestDeviceDimension = deviceHeight > deviceWidth ? deviceHeight : deviceWidth;
