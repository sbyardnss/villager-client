import type { PlayerRelated } from "./Player"
import type { Guest } from "./Guest"
//TODO: ADJUST SO THAT WE CAN USE ONE INTERFACE FOR BOTH
export interface Game {
  id: number,
  player_w?: PlayerRelated | Guest,
  player_b?: PlayerRelated | Guest,
  date_time: string,
  tournament?: number,
  tournament_round: number,
  time_setting?: number,
  winner?: PlayerRelated | Guest,
  pgn?: string,
  bye: boolean,
  accepted: boolean,
  win_style: string,
  target_winner_ct: number,
  target_player_b_ct: number,
  target_player_w_ct: number
}

export interface OutgoingGame {
  player_w: Guest | PlayerRelated,
  player_w_model_type: string,
  player_b: Guest | PlayerRelated | null,
  player_b_model_type: string,
  tournament: number,
  time_setting: number,
  win_style: string,
  accepted: true,
  tournament_round: number,
  winner?: Guest | PlayerRelated | null,
  winner_model_type?: string | null,
  bye: boolean,
  id?: number | undefined,
}

export interface DigitalGame {
  player_w: PlayerRelated | null,
  player_w_model_type: 'player',
  player_b: PlayerRelated | null,
  player_b_model_type: 'player',
  tournament: number,
  date_time: string,
  time_setting: number,
  win_style: 'checkmate' | 'draw' | null,
  accepted: true,
  tournament_round: number,
  winner?: PlayerRelated | null,
  winner_model_type?: 'player' | null,
  bye: boolean,
  id?: number | undefined,
  // computer_opponent?: boolean,
  pgn?: string,
}

export const digitalGameDefaults: DigitalGame = {
  id: undefined,
  player_w: {} as PlayerRelated,
  player_w_model_type: 'player',
  player_b: {} as PlayerRelated,
  player_b_model_type: 'player',
  tournament: 0,
  time_setting: 0,
  win_style: null,
  accepted: true,
  tournament_round: 0,
  winner: {} as PlayerRelated,
  winner_model_type: null,
  bye: false,
  // computer_opponent: true,
  pgn: "",
  date_time: "",
}