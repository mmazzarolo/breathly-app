import { Platform } from "react-native";

import { SettingsItemPickerIOS } from "./SettingsItemPickerIOS";
import { SettingsItemPickerAndroid } from "./SettingsItemPickerAndroid";

export const SettingsItemPicker =
  Platform.OS === "android" ? SettingsItemPickerAndroid : SettingsItemPickerIOS;
