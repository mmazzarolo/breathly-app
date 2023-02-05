import React from "react";
import { PropsWithChildren } from "react";

export interface SectionProps {
  label: string;
}

export interface LinkItemProps extends BaseItemProps {
  value: string;
  onPress: () => unknown;
}

export interface PickerItemProps extends BaseItemProps {
  value: string;
  options: { label: string; value: string }[];
  onValueChange: (value: string) => unknown;
}

export interface SwitchItemProps extends BaseItemProps {
  value: boolean;
  onValueChange?: (newValue: boolean) => void;
}

export interface StepperItemProps extends BaseItemProps {
  label?: string;
  value?: number | string;
  increaseDisabled?: boolean;
  decreaseDisabled?: boolean;
  onIncrease?: () => unknown;
  onDecrease?: () => unknown;
}

export interface RadioButtonItemProps extends BaseItemProps {
  text: string;
  secondaryText?: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

declare const SettingsUI: {
  Section: React.FC<PropsWithChildren<SectionProps>>;
  LinkItem: FC<LinkItemProps>;
  PickerItem: FC<SettingsItemPicker>;
  SwitchItem: FC<SwitchItemProps>;
  StepperItem: FC<StepperItemProps>;
  RadioButtonItem: FC<RadioButtonItemProps>;
};
