import { MaterialCommunityIcons } from "@expo/vector-icons";
import setColor from "color";
import React, { FC, PropsWithChildren, useEffect, useRef } from "react";
import { Animated, Switch, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { Touchable } from "@breathly/common/touchable";
import { colors } from "@breathly/design/colors";
import { animate } from "@breathly/utils/animate";
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
    <View className="border-b-hairline border-b-slate-300 pb-2 dark:border-b-slate-500">
      <View className="pt-4">
        <Text className="pl-4 pb-2 font-breathly-medium text-xs text-blue-400">{label}</Text>
        <View className="px-4">{children}</View>
      </View>
    </View>
  );
};

export interface BaseItemProps {
  label?: string;
  secondaryLabel?: string;
  style?: ViewStyle;
}

const BaseItem: FC<PropsWithChildren<BaseItemProps>> = ({
  label,
  secondaryLabel,
  style,
  children,
}) => {
  return (
    <View className="flex-row justify-between py-2 pr-2" style={style}>
      {label && (
        <View className="grow-1 flex-1 shrink flex-col justify-center pr-4">
          <Text className="text-slate-800 dark:text-white">{label}</Text>
          {secondaryLabel && <Text className="text-sm text-slate-500">{secondaryLabel}</Text>}
        </View>
      )}
      {children}
    </View>
  );
};

const LinkItem: FC<LinkItemProps> = ({ value, onPress, ...baseProps }) => {
  return (
    <Touchable onPress={onPress}>
      <BaseItem {...baseProps} secondaryLabel={value}></BaseItem>
    </Touchable>
  );
};

interface RadioButtonProps {
  checked?: boolean;
  onPress?: () => unknown;
  disabled?: boolean;
}

const RadioButton: FC<RadioButtonProps> = ({
  checked = false,
  onPress = () => null,
  disabled = false,
}) => {
  const animatedValue = useRef(new Animated.Value(checked ? 1 : 0)).current;
  useEffect(() => {
    animate(animatedValue, {
      toValue: checked ? 1 : 0,
      duration: 200,
    }).start();
  }, [checked]);
  return (
    <TouchableOpacity
      className="items-center justify-center rounded-full"
      style={{
        borderColor: disabled ? colors["stone-200"] : colors["blue-400"],
        width: 20,
        height: 20,
        borderWidth: 2,
      }}
      onPress={disabled ? undefined : onPress}
    >
      <Animated.View
        className="rounded-full"
        style={{
          width: 10,
          height: 10,
          backgroundColor: disabled ? colors["stone-200"] : colors["blue-400"],
          transform: [{ scale: animatedValue }],
        }}
      />
    </TouchableOpacity>
  );
};

const PickerItem: FC<PickerItemProps> = ({ value, options, onValueChange, ...baseProps }) => {
  return (
    <>
      {options.map((option) => (
        <TouchableOpacity onPress={() => onValueChange(option.value)} key={option.value}>
          <BaseItem {...baseProps} label={option.label}>
            <RadioButton
              checked={option.value === value}
              onPress={() => onValueChange(option.value)}
            />
          </BaseItem>
        </TouchableOpacity>
      ))}
    </>
  );
};

const SwitchItem: FC<SwitchItemProps> = ({ value, onValueChange, ...baseProps }) => {
  return (
    <BaseItem {...baseProps}>
      <Switch
        value={value}
        style={{ marginRight: -12 }}
        onValueChange={onValueChange}
        thumbColor={value ? colors["blue-400"] : colors["stone-200"]}
        trackColor={{
          true: setColor(colors["blue-400"]).alpha(0.5).rgb().string(),
          false: colors["slate-500"],
        }}
      />
    </BaseItem>
  );
};

const StepperItem: FC<StepperItemProps> = ({
  value,
  increaseDisabled,
  decreaseDisabled,
  onIncrease,
  onDecrease,
  ...baseProps
}) => {
  return (
    <BaseItem {...baseProps}>
      <View className="flex-row items-center rounded-md">
        <Touchable
          className="items-center justify-center rounded-md bg-blue-400 px-2 py-1 shadow-sm"
          style={{ opacity: decreaseDisabled ? 0.4 : 1 }}
          onPress={onDecrease}
          disabled={decreaseDisabled}
        >
          <MaterialCommunityIcons name="minus" size={16} color="white" />
        </Touchable>
        <View className="w-8 self-center px-2">
          <Text className="text-center font-breathly-mono font-semibold dark:text-white">
            {value}
          </Text>
        </View>
        <Touchable
          className="items-center justify-center rounded-md bg-blue-400 px-2 py-1 shadow-sm"
          style={{ opacity: increaseDisabled ? 0.4 : 1 }}
          onPress={onIncrease}
          disabled={increaseDisabled}
        >
          <MaterialCommunityIcons name="plus" size={16} color="white" />
        </Touchable>
      </View>
    </BaseItem>
  );
};

const RadioButtonItem: FC<RadioButtonItemProps> = ({
  text,
  secondaryText,
  selected,
  onPress,
  disabled,
  ...baseProps
}) => {
  return (
    <Touchable
      className="flex-col py-2"
      onPress={onPress}
      style={{ opacity: disabled ? 0.5 : 1 }}
      disabled={disabled}
    >
      <BaseItem {...baseProps} label={text} secondaryLabel={secondaryText}>
        <View className="items-center justify-center">
          <RadioButton checked={selected} disabled={disabled} onPress={onPress} />
        </View>
      </BaseItem>
    </Touchable>
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
