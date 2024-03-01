export interface PlayerRelated {
  id: number,
  full_name: string,
  // username: string,
}

export interface Player {
  id: number,
  full_name: string,
  username: string,
}

export interface PlayerPairingArgument {
  id: number | string;
  score: number;
}