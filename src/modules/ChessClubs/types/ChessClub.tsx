import type { GuestInClub, PlayerInClub } from "../../App/types";
export interface ChessClubCreate {
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: number | null;
  details: string | null;
  password?: string | null;
  has_password?: boolean;
  newPassword?: string | null;
  // oldPassword?: string | null;
}

export interface ChessClubEdit extends ChessClubCreate {
  has_password: boolean;
  guest_members: GuestInClub[];
  members: PlayerInClub[];
  manager: PlayerInClub;
  date: string;
  [key: string]: string | number | PlayerInClub | PlayerInClub[] | GuestInClub[] | boolean | null | undefined;

}
