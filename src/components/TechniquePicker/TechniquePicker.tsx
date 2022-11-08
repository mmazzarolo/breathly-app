import React, { FC, useState, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { techniques } from "../../config/techniques";
import { useAppContext } from "../../context/AppContext";
import { getNextIndex } from "../../utils/getNextIndex";
import { getPrevIndex } from "../../utils/getPrevIndex";
import { PageContainer } from "../PageContainer/PageContainer";
import { TechniquePickerButton } from "./TechniquePickerButton";
import { TechniquePickerDot } from "./TechniquePickerDot";
import { TechniquePickerItem } from "./TechniquePickerItem";
import { TechniquePickerItemCustomization } from "./TechniquePickerItemCustomization";
import {
  TechniquePickerViewPager,
  RefObject as TechniquePickerViewPagerRef,
} from "./TechniquePickerViewPager";

interface Props {
  visible: boolean;
  onHide: () => void;
  onBackButtonPress: () => void;
}

export const TechniquePicker: FC<Props> = ({ visible, onHide, onBackButtonPress }) => {
  const { technique, setTechniqueId, customPatternDurations } = useAppContext();
  const [animatingManually, setAnimatingManually] = useState(false);
  const viewPagerRef = useRef<TechniquePickerViewPagerRef>(null);
  const currentTechniqueIndex = techniques.findIndex((x) => x.id === technique.id);
  const [panX] = useState(new Animated.Value(0));

  const mapIndexToPosition = (index: number) => {
    if (index === currentTechniqueIndex) {
      return "curr";
    } else if (index === getPrevIndex(techniques, currentTechniqueIndex)) {
      return "prev";
    } else if (index === getNextIndex(techniques, currentTechniqueIndex)) {
      return "next";
    }
  };

  const handleButtonPress = (direction: "prev" | "next") => {
    setAnimatingManually(true);
    if (viewPagerRef.current) {
      viewPagerRef.current.animateTransition(direction);
    }
  };

  const setNewTechnique = (direction: "prev" | "next") => {
    setAnimatingManually(false);
    const newTechniqueIndex =
      direction === "next"
        ? getNextIndex(techniques, currentTechniqueIndex)
        : getPrevIndex(techniques, currentTechniqueIndex);
    const newTechnique = techniques[newTechniqueIndex];
    setTechniqueId(newTechnique.id);
  };

  const handleNextReached = () => setNewTechnique("next");
  const handlePrevReached = () => setNewTechnique("prev");

  const visibleTechniques = [
    techniques[getPrevIndex(techniques, currentTechniqueIndex)],
    techniques[currentTechniqueIndex],
    techniques[getNextIndex(techniques, currentTechniqueIndex)],
  ];

  return (
    <PageContainer
      title="Techniques"
      visible={visible}
      onBackButtonPress={onBackButtonPress}
      onHide={onHide}
    >
      <Animated.View style={styles.content}>
        <TechniquePickerViewPager
          ref={viewPagerRef}
          panX={panX}
          onNextReached={handleNextReached}
          onPrevReached={handlePrevReached}
          style={styles.viewPager}
        >
          {visibleTechniques.map((technique, index) => {
            const originalTechniqueIndex = techniques.findIndex((x) => x.id === technique.id);
            const position = mapIndexToPosition(originalTechniqueIndex);
            return (
              <TechniquePickerItem
                key={technique.id}
                position={position}
                panX={panX}
                name={technique.name}
                durations={technique.id === "custom" ? customPatternDurations : technique.durations}
                description={technique.description}
              >
                {technique.id === "custom" ? (
                  <TechniquePickerItemCustomization durations={customPatternDurations} />
                ) : undefined}
              </TechniquePickerItem>
            );
          })}
        </TechniquePickerViewPager>
        <Animated.View style={styles.footer}>
          <TechniquePickerButton
            disabled={animatingManually}
            direction="prev"
            onPress={() => handleButtonPress("prev")}
            testID="prev-technique-button"
          />
          <Animated.View style={[styles.dots]}>
            {techniques.map((technique, index) => {
              const position = mapIndexToPosition(index);
              return (
                <TechniquePickerDot
                  key={technique.id}
                  position={position}
                  panX={panX}
                  color={technique.color}
                  squared={technique.id === "custom"}
                />
              );
            })}
          </Animated.View>
          <TechniquePickerButton
            disabled={animatingManually}
            direction="next"
            onPress={() => handleButtonPress("next")}
            testID="next-technique-button"
          />
        </Animated.View>
      </Animated.View>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  viewPager: {
    flex: 1,
    width: "100%",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 32,
    marginBottom: 26,
  },
  arrow: {
    width: 20,
    height: 20,
    backgroundColor: "red",
  },
  arrowLeft: {},
  arrowRight: {},
});
