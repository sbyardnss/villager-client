import type { Tournament } from "../Tournament/Types";
import type { ChessClub, Villager } from "./types";

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