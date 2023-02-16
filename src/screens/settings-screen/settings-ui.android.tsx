import { MaterialCommunityIcons } from "@expo/vector-icons";
import setColor from "color";
import React, { FC, PropsWithChildren, useEffect, useRef } from "react";
import { Animated, Switch, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { Pressable } from "@breathly/common/pressable";
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

const Section: React.FC<PropsWithChildren<SectionProps>> = ({
  label,
  children,
  hideBottomBorderAndroid,
}) => {
  const bottomBorderClassName = "border-b-hairline border-b-slate-300 dark:border-b-slate-500";
  return (
    <View className={`pb-2 ${!hideBottomBorderAndroid && bottomBorderClassName}`}>
      <View className="pt-4">
        <Text className="pl-[72px] pb-2 text-xs text-blue-400">{label}</Text>
        {children}
      </View>
    </View>
  );
};

export interface BaseItemProps {
  label?: string;
  secondaryLabel?: string;
  style?: ViewStyle;
  leftItem?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

const BaseItem: FC<PropsWithChildren<BaseItemProps>> = ({
  label,
  secondaryLabel,
  onPress,
  style,
  leftItem,
  disabled,
  children,
}) => {
  return (
    <TouchableOpacity
      className="flex-row justify-between py-2 pr-8"
      style={{ paddingLeft: leftItem ? 0 : 72, opacity: disabled ? 0.5 : 1, ...style }}
      onPress={onPress}
      disabled={disabled || !onPress}
    >
      {leftItem && <View className="w-[72px] items-center justify-center">{leftItem}</View>}
      {label && (
        <View className="grow-1 flex-1 shrink flex-col justify-center pr-4">
          <Text className="text-slate-800 dark:text-white">{label}</Text>
          {secondaryLabel && <Text className="text-sm text-slate-500">{secondaryLabel}</Text>}
        </View>
      )}
      {children}
    </TouchableOpacity>
  );
};

const LinkItem: FC<LinkItemProps> = ({ value, onPress, ...baseProps }) => {
  return <BaseItem {...baseProps} secondaryLabel={value} onPress={onPress} />;
};

interface RadioButtonProps {
  selected?: boolean;
  onPress?: () => unknown;
  disabled?: boolean;
  style?: ViewStyle;
}

const RadioButton: FC<RadioButtonProps> = ({
  selected = false,
  onPress = () => null,
  disabled = false,
}) => {
  const animatedValue = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    animate(animatedValue, {
      toValue: selected ? 1 : 0,
      duration: 200,
    }).start();
  }, [selected]);
  return (
    <TouchableOpacity
      className="my-1 items-center justify-center rounded-full"
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

const RadioButtonItem: FC<RadioButtonItemProps> = ({
  selected,
  disabled,
  onPress,
  ...baseProps
}) => {
  return (
    <BaseItem
      {...baseProps}
      onPress={onPress}
      disabled={disabled}
      leftItem={<RadioButton selected={selected} disabled={disabled} onPress={onPress} />}
    />
  );
};

const PickerItem: FC<PickerItemProps> = ({ value, options, onValueChange, ...baseProps }) => {
  return (
    <>
      {options.map((option) => (
        <RadioButtonItem
          {...baseProps}
          onPress={() => onValueChange(option.value)}
          key={option.value}
          label={option.label}
          selected={option.value === value}
        />
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
          false: colors["stone-300"],
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
  fractionDigits,
  ...baseProps
}) => {
  return (
    <BaseItem {...baseProps}>
      <View className="flex-row items-center">
        <Pressable
          className="items-center justify-center rounded-md bg-blue-400 px-2 py-1"
          style={{ opacity: decreaseDisabled ? 0.4 : 1 }}
          onPress={onDecrease}
          onLongPressInterval={onDecrease}
          disabled={decreaseDisabled}
        >
          <MaterialCommunityIcons name="minus" size={16} color="white" />
        </Pressable>
        <View className={`${fractionDigits > 0 ? "w-14" : "w-8"} self-center px-2`}>
          <Text
            className="text-center font-breathly-mono font-semibold dark:text-white"
            numberOfLines={1}
          >
            {typeof value === "number" && fractionDigits > 0
              ? value.toFixed(fractionDigits)
              : value}
          </Text>
        </View>
        <Pressable
          className="items-center justify-center rounded-md bg-blue-400 px-2 py-1"
          style={{ opacity: increaseDisabled ? 0.4 : 1 }}
          onPress={onIncrease}
          onLongPressInterval={onIncrease}
          disabled={increaseDisabled}
        >
          <MaterialCommunityIcons name="plus" size={16} color="white" />
        </Pressable>
      </View>
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
