import type { PlayerRelated } from "./Player";
import type { Match } from "tournament-pairings/dist/Match";
import type { Guest } from "./Guest";
export interface NewTournament {
  title: string;
  // creator: number;
  competitors: PlayerRelated[];
  guest_competitors: Guest[];
  time_setting: number;
  rounds: number;
  in_person: boolean;
  pairings: Match[];
  club: number;
}

export const newTournamentDefaults: NewTournament = {
  title: "",
  // creator: 0,
  competitors: [],
  guest_competitors: [],
  time_setting: 0,
  rounds: 0,
  in_person: true,
  pairings: [],
  club: 0,
}
export interface Tournament extends NewTournament {
  id: number;
  date: string;
  complete: boolean,
  creator: PlayerRelated;
}

export const selectedTournamentDefaults: Tournament = {
  id: 0,
  title: "",
  creator: {
    id: 0,
    full_name: "",
  },
  competitors: [],
  guest_competitors: [],
  time_setting: 0,
  rounds: 0,
  in_person: true,
  pairings: [],
  club: 0,
  date: "",
  complete: false,
}
