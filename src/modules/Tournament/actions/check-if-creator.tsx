import type { Villager } from "../../App/types";

export const checkIfUserIsAppCreator = (user: Villager) => {
  if (user.userId === 1) {
    return true;
  } else {
    return false;
  }
} 