import {
  AlertDialog,
  Column,
  FilledTonalButton,
  Host,
  ListItem,
  RadioButton,
  Row,
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
  Switch,
  Text,
  TextButton,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import {
  alpha,
  clickable,
  clip,
  fillMaxWidth,
  padding,
  selectable,
  Shapes,
  testID as testTagModifier,
  toggleable,
  width as widthModifier,
} from "@expo/ui/jetpack-compose/modifiers";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { FC, PropsWithChildren, useState } from "react";
import { Pressable, Text as NativeText, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@breathly/design/theme";
import {
  HeaderProps,
  LinkItemProps,
  PickerItemProps,
  RadioButtonItemProps,
  StepperItemProps,
  SwitchItemProps,
  SectionProps,
  type SettingsUIModule,
} from "./settings-ui.types";

type ComposeModifier = ReturnType<typeof clickable>;

// Stock Android settings cards, measured on a Pixel emulator: 20dp corners on
// the outer edges of a group, small corners between grouped neighbours, and
// 2dp gaps.
const outerCornerRadius = 20;
const innerCornerRadius = 5;

type GroupPosition = "single" | "first" | "middle" | "last";
type GroupPositionProp = { groupPosition?: GroupPosition };

const groupCornerRadii = (groupPosition: GroupPosition) => {
  const top =
    groupPosition === "single" || groupPosition === "first" ? outerCornerRadius : innerCornerRadius;
  const bottom =
    groupPosition === "single" || groupPosition === "last" ? outerCornerRadius : innerCornerRadius;
  return { topStart: top, topEnd: top, bottomStart: bottom, bottomEnd: bottom };
};

// The Compose palette must follow the app theme (which the user can force away
// from the system theme), so every Host and color lookup gets the scheme from
// the settings store instead of the device.
const useSettingsColorScheme = useColorScheme;

const useCardColor = () => {
  const colorScheme = useSettingsColorScheme();
  const colors = useMaterialColors({ colorScheme });
  return colors.surfaceBright;
};

// The stock settings title bar: a tonal circular back button and a large
// plain title, drawn by the screen itself (the native-stack header is hidden
// on Android, see navigator.tsx). Plain React Native views: the icon comes
// from the app's icon font, which renders crisply where a Compose text glyph
// did not.
const Header: FC<HeaderProps> = ({ title, onBack }) => {
  const colorScheme = useSettingsColorScheme();
  const colors = useMaterialColors({ colorScheme });
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: 20,
      }}
    >
      <Pressable
        onPress={onBack}
        testID="settings.header.back"
        accessibilityRole="button"
        accessibilityLabel="Back"
        // A borderless ripple draws a circle and needs no clipping; a bounded
        // ripple under a rounded clip flashes as a square layer.
        android_ripple={{
          color: colorScheme === "dark" ? "rgba(255, 255, 255, 0.16)" : "rgba(27, 27, 34, 0.12)",
          borderless: true,
          radius: 24,
        }}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.surfaceContainerHighest,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
      </Pressable>
      <NativeText style={{ marginLeft: 16, fontSize: 24, color: colors.onSurface }}>
        {title}
      </NativeText>
    </View>
  );
};

const Section: React.FC<PropsWithChildren<SectionProps>> = ({ label, children }) => {
  const colorScheme = useSettingsColorScheme();
  const colors = useMaterialColors({ colorScheme });
  const items = React.Children.toArray(children);
  return (
    <Host matchContents={{ vertical: true }} colorScheme={colorScheme}>
      <Column
        modifiers={[fillMaxWidth(), padding(16, 0, 16, 0)]}
        verticalArrangement={{ spacedBy: 2 }}
      >
        <Text
          color={colors.primary}
          style={{ typography: "labelLarge" }}
          modifiers={[padding(16, 24, 16, 8)]}
        >
          {label}
        </Text>
        {items.map((child, index) => {
          if (!React.isValidElement(child)) return child;
          const groupPosition: GroupPosition =
            items.length === 1
              ? "single"
              : index === 0
                ? "first"
                : index === items.length - 1
                  ? "last"
                  : "middle";
          return React.cloneElement(child as React.ReactElement<GroupPositionProp>, {
            groupPosition,
          });
        })}
      </Column>
    </Host>
  );
};

interface ItemRowProps extends GroupPositionProp {
  label?: string;
  secondaryLabel?: string;
  testID?: string;
  modifiers?: ComposeModifier[];
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

const ItemRow: FC<ItemRowProps> = ({
  label,
  secondaryLabel,
  testID,
  modifiers = [],
  leading,
  trailing,
  groupPosition = "single",
}) => {
  const cardColor = useCardColor();
  return (
    <ListItem
      colors={{ containerColor: cardColor }}
      modifiers={[
        fillMaxWidth(),
        clip(Shapes.RoundedCorner(groupCornerRadii(groupPosition))),
        ...(testID ? [testTagModifier(testID)] : []),
        ...modifiers,
      ]}
    >
      {leading != null && <ListItem.LeadingContent>{leading}</ListItem.LeadingContent>}
      {label != null && (
        <ListItem.HeadlineContent>
          <Text>{label}</Text>
        </ListItem.HeadlineContent>
      )}
      {secondaryLabel != null && (
        <ListItem.SupportingContent>
          <Text>{secondaryLabel}</Text>
        </ListItem.SupportingContent>
      )}
      {trailing != null && <ListItem.TrailingContent>{trailing}</ListItem.TrailingContent>}
    </ListItem>
  );
};

const LinkItem: FC<LinkItemProps & GroupPositionProp> = ({
  label,
  value,
  onPress,
  testID,
  groupPosition,
}) => {
  return (
    <ItemRow
      label={label}
      secondaryLabel={value}
      testID={testID}
      groupPosition={groupPosition}
      modifiers={[clickable(onPress)]}
    />
  );
};

const RadioButtonItem: FC<RadioButtonItemProps & GroupPositionProp> = ({
  label,
  secondaryLabel,
  selected = false,
  onPress,
  disabled,
  testID,
  groupPosition,
}) => {
  const interactionModifiers: ComposeModifier[] = disabled
    ? [alpha(0.5)]
    : [selectable(selected, () => onPress?.(), "radioButton")];
  return (
    <ItemRow
      label={label}
      secondaryLabel={secondaryLabel}
      testID={testID}
      groupPosition={groupPosition}
      modifiers={interactionModifiers}
      leading={<RadioButton selected={selected} onClick={disabled ? undefined : onPress} />}
    />
  );
};

// Single-choice settings follow the Android "list preference" pattern: a row
// with the current value that opens a radio dialog. Selecting applies and
// closes; Cancel keeps the current value.
const PickerItem: FC<PickerItemProps & GroupPositionProp> = ({
  label,
  value,
  options,
  onValueChange,
  testID,
  groupPosition,
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const cardColor = useCardColor();
  const selectedOption = options.find((option) => option.value === value);
  const closeDialog = () => setDialogVisible(false);
  const selectOption = (optionValue: string) => {
    onValueChange(optionValue);
    closeDialog();
  };
  // Material 3: segmented buttons for small exclusive sets; the dialog-based
  // "list preference" pattern for longer ones.
  if (options.length <= 3) {
    return (
      <ListItem
        colors={{ containerColor: cardColor }}
        modifiers={[
          fillMaxWidth(),
          clip(Shapes.RoundedCorner(groupCornerRadii(groupPosition ?? "single"))),
          ...(testID ? [testTagModifier(testID)] : []),
        ]}
      >
        <ListItem.HeadlineContent>
          <Text>{label}</Text>
        </ListItem.HeadlineContent>
        <ListItem.SupportingContent>
          <SingleChoiceSegmentedButtonRow modifiers={[fillMaxWidth(), padding(0, 8, 0, 4)]}>
            {options.map((option) => (
              <SegmentedButton
                key={option.value}
                selected={option.value === value}
                onClick={() => onValueChange(option.value)}
                modifiers={testID ? [testTagModifier(`${testID}.option.${option.value}`)] : []}
              >
                <SegmentedButton.Label>
                  <Text maxLines={1}>{option.label}</Text>
                </SegmentedButton.Label>
              </SegmentedButton>
            ))}
          </SingleChoiceSegmentedButtonRow>
        </ListItem.SupportingContent>
      </ListItem>
    );
  }
  return (
    <>
      <ItemRow
        label={label}
        secondaryLabel={selectedOption?.label ?? value}
        testID={testID}
        groupPosition={groupPosition}
        modifiers={[clickable(() => setDialogVisible(true))]}
      />
      {dialogVisible && (
        <AlertDialog onDismissRequest={closeDialog}>
          <AlertDialog.Title>
            <Text>{label ?? ""}</Text>
          </AlertDialog.Title>
          <AlertDialog.Text>
            <Column modifiers={[fillMaxWidth()]}>
              {options.map((option) => (
                <Row
                  key={option.value}
                  verticalAlignment="center"
                  modifiers={[
                    fillMaxWidth(),
                    selectable(
                      option.value === value,
                      () => selectOption(option.value),
                      "radioButton",
                    ),
                    ...(testID ? [testTagModifier(`${testID}.option.${option.value}`)] : []),
                    padding(0, 12, 0, 12),
                  ]}
                >
                  <RadioButton
                    selected={option.value === value}
                    onClick={() => selectOption(option.value)}
                  />
                  <Text modifiers={[padding(8, 0, 0, 0)]}>{option.label}</Text>
                </Row>
              ))}
            </Column>
          </AlertDialog.Text>
          <AlertDialog.DismissButton>
            <TextButton onClick={closeDialog}>
              <Text>Cancel</Text>
            </TextButton>
          </AlertDialog.DismissButton>
        </AlertDialog>
      )}
    </>
  );
};

const SwitchItem: FC<SwitchItemProps & GroupPositionProp> = ({
  label,
  secondaryLabel,
  value,
  onValueChange,
  testID,
  groupPosition,
}) => {
  return (
    <ItemRow
      label={label}
      secondaryLabel={secondaryLabel}
      testID={testID}
      groupPosition={groupPosition}
      modifiers={[toggleable(value, () => onValueChange?.(!value))]}
      trailing={<Switch value={value} onCheckedChange={onValueChange} />}
    />
  );
};

const formatStepperValue = (value: number | string | undefined, fractionDigits: number) =>
  typeof value === "number" && fractionDigits > 0 ? value.toFixed(fractionDigits) : `${value}`;

export const getStepperValueWidth = (fractionDigits: number) => (fractionDigits > 0 ? 44 : 48);

const StepperItem: FC<StepperItemProps & GroupPositionProp> = ({
  label,
  secondaryLabel,
  value,
  increaseDisabled,
  decreaseDisabled,
  onIncrease,
  onDecrease,
  fractionDigits = 0,
  testID,
  groupPosition,
}) => {
  return (
    <ItemRow
      label={label}
      secondaryLabel={secondaryLabel}
      testID={testID}
      groupPosition={groupPosition}
      trailing={
        // KNOWN GAP: these two buttons have no accessible name, so TalkBack reads "−" and
        // "+" with no clue what they change. iOS and web set "Increase <label>" and
        // "Decrease <label>". It cannot be fixed with the current `@expo/ui` API: the
        // `semantics` modifier accepts only `contentType`, `FilledTonalButton` exposes no
        // content description, and `Icon` — the one component that takes one — needs a
        // vector drawable rather than a text glyph. Revisit when @expo/ui grows the prop.
        <Row horizontalArrangement={{ spacedBy: 4 }} verticalAlignment="center">
          <FilledTonalButton
            enabled={!decreaseDisabled}
            onClick={onDecrease}
            modifiers={testID ? [testTagModifier(`${testID}.decrease`)] : []}
          >
            <Text>−</Text>
          </FilledTonalButton>
          <Text
            style={{ textAlign: "center" }}
            modifiers={[
              widthModifier(getStepperValueWidth(fractionDigits)),
              ...(testID ? [testTagModifier(`${testID}.value`)] : []),
            ]}
          >
            {formatStepperValue(value, fractionDigits)}
          </Text>
          <FilledTonalButton
            enabled={!increaseDisabled}
            onClick={onIncrease}
            modifiers={testID ? [testTagModifier(`${testID}.increase`)] : []}
          >
            <Text>+</Text>
          </FilledTonalButton>
        </Row>
      }
    />
  );
};

export const SettingsUI: SettingsUIModule = {
  Section,
  Header,
  LinkItem,
  PickerItem,
  SwitchItem,
  StepperItem,
  RadioButtonItem,
};
