import type { PlayerRelated } from "./Player"

export interface Game {
  id: number,
  player_w?: PlayerRelated,
  player_b?: PlayerRelated,
  date_time: string,
  tournament?: number,
  tournament_round: number,
  time_setting?: number,
  winner?: PlayerRelated,
  pgn?: string,
  bye: boolean,
  accepted: boolean,
  win_style: string,
  target_winner_ct: number,
  target_player_b_ct: number,
  target_player_w_ct: number
}
