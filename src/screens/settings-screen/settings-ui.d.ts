import React from "react";
import { PropsWithChildren } from "react";

export interface SectionProps {
  label: string;
  hideBottomBorderAndroid?: boolean;
}

interface CommonItemProps {
  label?: string;
  secondaryLabel?: string;
}

export interface LinkItemProps extends CommonItemProps {
  value: string;
  onPress: () => unknown;
}

export interface PickerItemProps extends CommonItemProps {
  value: string;
  options: { label: string; value: string }[];
  onValueChange: (value: string) => unknown;
}

export interface SwitchItemProps extends CommonItemProps {
  value: boolean;
  onValueChange?: (newValue: boolean) => void;
}

export interface StepperItemProps extends CommonItemProps {
  value?: number | string;
  increaseDisabled?: boolean;
  decreaseDisabled?: boolean;
  onIncrease?: () => unknown;
  onDecrease?: () => unknown;
}

export interface RadioButtonItemProps extends CommonItemProps {
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
