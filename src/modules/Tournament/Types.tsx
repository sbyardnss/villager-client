export interface NewTournament {
  title: string;
  creator: number;
  competitors: PlayerOnTournament[];
  guest_competitors: Guest[];
  timeSetting: number;
  rounds: number;
  in_person: boolean;
  pairings: TournamentPairing[];
  club: number;
}

export const newTournamentDefaults: NewTournament = {
  title: "",
  creator: 0,
  competitors: [],
  guest_competitors: [],
  timeSetting: 0,
  rounds: 0,
  in_person: true,
  pairings: [],
  club: 0,
}
export interface Tournament extends NewTournament {
  id: number;
  date: string;
}


export interface Player {
  id: number;
  user: Object;
  full_name: string;
  email: string;
  username: string;
  my_clubs: number[];
}

export interface PlayerOnTournament {
  id: number;
  full_name: string;
}

export interface Guest {
  id: number;
  full_name: string;
  guest_id: string;
}

export interface TournamentPairing {
  round: number;
  match: number;
  player1: number | string;
  player2: number | string;
}

export interface TimeSetting {
  id: number;
  time_amount: number,
  increment: number,
}