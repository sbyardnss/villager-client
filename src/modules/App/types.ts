export interface Villager {
  valid: boolean,
  token: string,
  userId: number,
}

export interface ChessClub {
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

export interface GuestInClub {
  id: number,
  full_name: string,
  guest_id: string,
}

export interface PlayerInClub {
  id: number,
  full_name: string,
  username: string,
}