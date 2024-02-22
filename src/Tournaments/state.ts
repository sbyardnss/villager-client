export interface Tournament {
  id: number,
  title: string,
  creator: number,
  competitors: PlayerOnTournament[],
  guest_competitors: GuestOnTournament[],
  timeSetting: number,
  rounds: number,
  in_person: boolean,
  pairings: TournamentPairing[],
  club: number,
}

interface PlayerOnTournament {
  id: number,
  full_name: string,
}

interface GuestOnTournament {
  id: number,
  full_name: string,
  guest_id: string,
}

interface TournamentPairing {
  round: number,
  match: number,
  player1: number | string,
  player2: number | string,
}