import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { useColorScheme } from "nativewind";
import React, { FC, PropsWithChildren, useState } from "react";
import { LayoutAnimation, Switch, Text, View, ViewStyle } from "react-native";
import { Pressable } from "@breathly/common/pressable";
import { colors } from "@breathly/design/colors";
import {
  LinkItemProps,
  PickerItemProps,
  RadioButtonItemProps,
  StepperItemProps,
  SwitchItemProps,
  SectionProps,
} from "./settings-ui";

const Section: React.FC<PropsWithChildren<SectionProps>> = ({ label, children }) => {
  return (
    <View className="pt-4">
      <Text className="mb-2 px-4 text-xs uppercase text-slate-500">{label}</Text>
      <View className="rounded-xl bg-white dark:bg-slate-800">
        {React.Children.map(children, (child, index) =>
          index === 0 || !child ? (
            child
          ) : (
            <>
              <View className="ml-4 h-hairline bg-stone-200 dark:bg-slate-500" />
              {child}
            </>
          )
        )}
      </View>
    </View>
  );
};

export interface BaseItemProps {
  label?: string;
  secondaryLabel?: string;
  iconName?: any;
  iconBackgroundColor?: string;
  style?: ViewStyle;
}

const BaseItem: FC<PropsWithChildren<BaseItemProps>> = ({
  label,
  iconName,
  iconBackgroundColor,
  secondaryLabel,
  children,
}) => {
  return (
    <View className="flex-row items-center justify-between py-2 px-4">
      {(iconName || label) && (
        <View className="flex-row items-center">
          {iconName && (
            <View className="mr-2 rounded-md" style={{ backgroundColor: iconBackgroundColor }}>
              <Ionicons style={{ padding: 4 }} name={iconName} size={18} color="white" />
            </View>
          )}
          <View className="flex-col">
            <Text className="dark:text-white">{label}</Text>
            {secondaryLabel && <Text className="text-slate-500">{secondaryLabel}</Text>}
          </View>
        </View>
      )}
      {children}
    </View>
  );
};

export const LinkItem: FC<LinkItemProps> = ({ value, onPress, ...baseProps }) => {
  return (
    <Pressable onPress={onPress}>
      <BaseItem {...baseProps}>
        <View className="flex-row items-center">
          <Text className="text-slate-500">{value}</Text>
          <Ionicons
            style={{ padding: 4 }}
            name={"ios-chevron-forward"}
            size={18}
            color={colors["slate-500"]}
          />
        </View>
      </BaseItem>
    </Pressable>
  );
};

export const PickerItem: FC<PickerItemProps> = ({
  value,
  options,
  onValueChange,
  ...baseProps
}) => {
  const { colorScheme } = useColorScheme();
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    LayoutAnimation.easeInEaseOut();
    setExpanded((prevExpanded) => !prevExpanded);
  };
  return (
    <>
      <Pressable onPress={toggleExpanded}>
        <BaseItem {...baseProps}>
          <Text className="text-blue-500">
            {options.find((option) => option.value === value).label}
          </Text>
        </BaseItem>
      </Pressable>
      {expanded && (
        <Picker selectedValue={value} onValueChange={onValueChange}>
          {options.map(({ label, value }) => (
            <Picker.Item
              key={value}
              label={label}
              value={value}
              color={colorScheme === "dark" ? "white" : undefined}
            />
          ))}
        </Picker>
      )}
    </>
  );
};

export const SwitchItem: FC<SwitchItemProps> = ({ value, onValueChange, ...baseProps }) => {
  return (
    <BaseItem {...baseProps}>
      <Switch value={value} onValueChange={onValueChange} />
    </BaseItem>
  );
};

export const StepperItem: FC<StepperItemProps> = ({
  value,
  increaseDisabled,
  decreaseDisabled,
  onIncrease,
  onDecrease,
  fractionDigits,
  ...baseProps
}) => {
  const { colorScheme } = useColorScheme();
  return (
    <BaseItem {...baseProps}>
      <View className="flex-row rounded-md border-hairline border-stone-200 dark:border-slate-600">
        <Pressable
          className="items-center justify-center  rounded-l-md bg-gray-100 px-3 py-1 dark:bg-slate-700"
          style={{ opacity: decreaseDisabled ? 0.2 : 1 }}
          onPress={onDecrease}
          onLongPressInterval={onDecrease}
          disabled={decreaseDisabled}
        >
          <Ionicons
            name={"ios-remove"}
            size={18}
            color={colorScheme === "dark" ? "white" : colors["slate-500"]}
          />
        </Pressable>
        <View className={`${fractionDigits > 0 ? "w-14" : "w-8"} self-center px-2`}>
          <Text
            className="text-center font-breathly-mono dark:text-white"
            style={{ fontVariant: ["tabular-nums"] }}
            numberOfLines={1}
          >
            {typeof value === "number" && fractionDigits > 0
              ? value.toFixed(fractionDigits)
              : value}
          </Text>
        </View>
        <Pressable
          className="items-center justify-center  rounded-r-md bg-gray-100 px-3 py-1 dark:bg-slate-700"
          style={{ opacity: increaseDisabled ? 0.2 : 1 }}
          onPress={onIncrease}
          onLongPressInterval={onIncrease}
          disabled={increaseDisabled}
        >
          <Ionicons
            name={"ios-add"}
            size={18}
            color={colorScheme === "dark" ? "white" : colors["slate-500"]}
          />
        </Pressable>
      </View>
    </BaseItem>
  );
};

export const RadioButtonItem: FC<RadioButtonItemProps> = ({
  label,
  secondaryLabel,
  selected,
  onPress,
  disabled,
  ...baseProps
}) => {
  return (
    <BaseItem {...baseProps}>
      <Pressable
        onPress={onPress}
        className="flex-shrink flex-row items-center py-2"
        style={{ opacity: disabled ? 0.5 : 1 }}
        disabled={disabled}
      >
        <View className="flex-shrink">
          <Text className="dark:text-white">{label}</Text>
          <Text className="text-slate-500">{secondaryLabel}</Text>
        </View>
        <View className="w-6 grow items-end">
          {selected && (
            <Ionicons name={"ios-checkmark-sharp"} size={18} color={colors["blue-500"]} />
          )}
        </View>
      </Pressable>
    </BaseItem>
  );
};

export const SettingsUI = {
  Section,
  LinkItem,
  PickerItem,
  SwitchItem,
  StepperItem,
  RadioButtonItem,
};
