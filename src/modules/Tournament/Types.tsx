import type { Match } from "tournament-pairings/dist/Match";
export interface NewTournament {
  title: string;
  creator: number;
  competitors: PlayerOnTournament[];
  guest_competitors: Guest[];
  timeSetting: number;
  rounds: number;
  in_person: boolean;
  pairings: Match[];
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


export interface PlayerPairingArgument {
  id: number | string;
  score: number;
}
// export interface TournamentPairing {
//   round: number;
//   match: number;
//   player1: number | string;
//   player2: number | string;
// }

export interface TimeSetting {
  id: number;
  time_amount: number,
  increment: number,
}



// From tournament Pairings:

// export interface Match {
//   round: number;
//   match: number;
//   player1: string | number | null;
//   player2: string | number | null;
//   win?: {
//     round: number;
//     match: number;
//   };
//   loss?: {
//     round: number;
//     match: number;
//   };
// }

// interface tournPlayer {
//   id: string | number;
//   score: number;
//   pairedUpDown?: boolean;
//   receivedBye?: boolean;
//   avoid?: Array<string | number>;
//   colors?: Array<'w' | 'b'>;
//   rating?: number | null;
// }