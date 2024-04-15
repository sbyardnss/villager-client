import { AppStateDefaults } from "../state";
import type { Villager } from "../types";

export function SetLoggedInUser(user: Villager) {
  AppStateDefaults.user = user;
}