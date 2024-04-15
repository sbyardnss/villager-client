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

export const playerRelatedDefaults: PlayerRelated = {
  id: 0,
  full_name: '',
}