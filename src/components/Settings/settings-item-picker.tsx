import { Platform } from "react-native";
import { SettingsItemPickerAndroid } from "./settings-item-picker-android";
import { SettingsItemPickerIOS } from "./settings-item-picker-ios";

export const SettingsItemPicker =
  Platform.OS === "android" ? SettingsItemPickerAndroid : SettingsItemPickerIOS;
