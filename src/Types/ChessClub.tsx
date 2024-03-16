// import type {, PlayerInClub } from "../modules/App/types";
import type { PlayerRelated } from "./Player";
import type { Guest } from "./Guest";


export interface ChessClubCreate {
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: number | null;
  details: string | null;
  password?: string | null;
  // has_password?: boolean;
  // newPassword?: string | null;
  // oldPassword?: string | null;
  [key: string]: any;

}

export interface ChessClub extends ChessClubCreate {
  id: number;
  manager: PlayerRelated;
  date: string;
  members: PlayerRelated[];
  guest_members: Guest[];
  has_password: boolean;
  [key: string]: string | number | PlayerRelated | PlayerRelated[] | Guest[] | boolean | null | undefined;
}

export interface ChessClubEdit extends ChessClub {
  newPassword: string | null;
}




export const chessClubDefaults: ChessClub = {
  id: 0,
  name: "",
  manager: {
    id: 0,
    full_name: "",
    // username: "",
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