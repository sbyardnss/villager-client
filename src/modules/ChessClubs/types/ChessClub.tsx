import type { GuestInClub, PlayerInClub } from "../../App/types";
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
  has_password: boolean;
  newPassword?: string;
  guest_members: GuestInClub[];
  members: PlayerInClub[];
  manager: PlayerInClub;
  date: string;
  [key: string]: any;

}
