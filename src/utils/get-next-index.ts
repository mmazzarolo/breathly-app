export const getNextIndex = <T>(arr: T[], currentIndex: number) => {
  return currentIndex < arr.length - 1 ? currentIndex + 1 : 0;
};
