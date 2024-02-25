export interface ChessClubCreateEdit {
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: number | null;
  details: string | null;
  password?: string | null;
  newPassword?: string | null;
  oldPassword?: string | null;
}