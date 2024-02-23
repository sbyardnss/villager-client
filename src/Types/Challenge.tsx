import type { PlayerRelated } from "./Player";

export interface ChallengeNew {
  player_w: number | null;
  player_w_model_type: string | null;
  player_b: number | null;
  player_b_model_type: string | null;
  accepted: boolean;
  computer_opponent: boolean;
  winner: number | null;
}

export interface ChallengeCreated {
  id: number,
  player_w: PlayerRelated | null;
  player_w_model_type: string | null;
  player_b: PlayerRelated | null;
  player_b_model_type: string | null;
  accepted: boolean;
  computer_opponent: boolean;
  winner: number | null;
}

export interface ChallengeEditing {
  id: number,
  player_w: PlayerRelated | null | number;
  player_w_model_type: string | null;
  player_b: PlayerRelated | null | number;
  player_b_model_type: string | null;
  accepted: boolean;
  computer_opponent: boolean;
  winner: number | null;
}