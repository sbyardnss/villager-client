export interface Player {
  id: number,
  user: Object,
  full_name: string,
  email: string,
  username: string,
  my_clubs: number[],
}

export interface PlayerOnTournament {
  id: number,
  full_name: string,
}

export interface Guest {
  id: number,
  full_name: string,
  guest_id: string,
}

export interface TournamentPairing {
  round: number,
  match: number,
  player1: number | string,
  player2: number | string,
}

