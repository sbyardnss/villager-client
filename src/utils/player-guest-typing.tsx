import type { Player, PlayerRelated } from "../Types/Player";
import type { Guest } from "../Types/Guest";

export const getPlayerType = (player: Player | PlayerRelated | Guest) => {
  if ('guest_id' in player) {
    return 'Guest';
  } else if ('my_clubs' in player) {
    return 'Player';
  } else {
    return 'PlayerRelated';
  }
}