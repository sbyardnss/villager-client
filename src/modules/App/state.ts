import type { Tournament } from "../../Types/Tournament";
import type { Villager } from "./types";
import type { ChessClub } from "../../Types/ChessClub";

interface AppState {
  user: Villager,
  clubs: ChessClub[],
  activeTournaments: Tournament[],
}

export const AppStateDefaults: AppState = {
  user: {
    valid: false,
    token: '',
    userId: 0,
  },
  clubs: [],
  activeTournaments: [],
}