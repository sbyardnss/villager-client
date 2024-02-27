export interface Villager {
  valid: boolean;
  token: string;
  userId: number;
}

export interface ChessClub {
  id: number;
  name: string;
  manager: PlayerInClub;
  date: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: number | null;
  details: string | null;
  members: PlayerInClub[];
  guest_members: GuestInClub[];
  has_password: boolean;
  [key: string]: string | number | PlayerInClub | PlayerInClub[] | GuestInClub[] | boolean | null;
}

export const chessClubDefaults: ChessClub = {
  id: 0,
  name: "",
  manager: {
    id: 0,
    full_name: "",
    username: "",
  },
  date: "",
  address: "",
  city: "",
  state: "",
  zipcode: 0,
  details: "",
  members: [],
  guest_members: [],
  has_password: false,
}
// export interface CreatingChessClub {
//   name: string;
//   address: string | null;
//   city: string | null;
//   state: string | null;
//   zipcode: number | null;
//   details: string | null;
//   password: string | null;
// }
export interface ChessClubCreate extends ChessClub {
  password: string | null;
}
export interface GuestInClub {
  id: number;
  full_name: string;
  guest_id: string;
}

export interface PlayerInClub {
  id: number;
  full_name: string;
  username: string;
}