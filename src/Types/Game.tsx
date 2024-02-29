import type { PlayerRelated } from "./Player"
import type { Guest } from "../modules/Tournament/Types"
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
