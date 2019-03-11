export const getPrevIndex = <T>(arr: T[], currentIndex: number) => {
  return currentIndex > 0 ? currentIndex - 1 : arr.length - 1;
};
