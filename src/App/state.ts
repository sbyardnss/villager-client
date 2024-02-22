import type { Tournament } from "../modules/Tournaments/state";

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


interface Villager {
  valid: boolean,
  token: string,
  userId: number,
}

interface ChessClub {
  id: number,
  name: string,
  manager: PlayerInClub,
  date: string,
  address: string,
  city: string,
  state: string,
  zipcode: number,
  details: string,
  members: PlayerInClub[],
  guest_members: GuestInClub[],
  has_password: boolean,
}

interface GuestInClub {
  id: number,
  full_name: string,
  guest_id: string,
}

interface PlayerInClub {
  id: number,
  full_name: string,
  username: string,
}