import type { PlayerRelated } from "./Player";

export interface CommunityPost {
  id: number,
  poster: PlayerRelated,
  message: string,
  date_time: string,
  club: number,
}

