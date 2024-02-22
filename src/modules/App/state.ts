import type { Tournament } from "../Tournaments/state";
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