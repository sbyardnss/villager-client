import type { PlayerOnTournament, Guest, TournamentPairing } from "./types";

export interface Tournament {
  id: number,
  title: string,
  creator: number,
  competitors: PlayerOnTournament[],
  guest_competitors: Guest[],
  timeSetting: number,
  rounds: number,
  in_person: boolean,
  pairings: TournamentPairing[],
  club: number,
}