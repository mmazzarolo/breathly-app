import { techniques } from "../config/techniques";

export const getTechnique = (techniqueId: string) => {
  return techniques.find(x => x.id === techniqueId)!;
};
