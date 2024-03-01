import type { PlayerRelated } from "./Player"
import type { Guest } from "./Guest"

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
  player_b: Guest | PlayerRelated | undefined,
  player_b_model_type: string,
  tournament: number,
  time_setting: number,
  win_style: string,
  accepted: true,
  tournament_round: number,
  winner?: Guest | PlayerRelated | null,
  winner_model_type?: string | null,
  bye: boolean,
  id?: number,
}