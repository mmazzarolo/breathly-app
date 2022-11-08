import { Platform } from "react-native";
import { SettingsItemPickerAndroid } from "./SettingsItemPickerAndroid";
import { SettingsItemPickerIOS } from "./SettingsItemPickerIOS";

export const SettingsItemPicker =
  Platform.OS === "android" ? SettingsItemPickerAndroid : SettingsItemPickerIOS;
