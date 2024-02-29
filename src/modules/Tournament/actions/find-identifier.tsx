import { PlayerRelated } from "../../../Types/Player";
import { Guest, Player, PlayerOnTournament } from "../Types"

export const findIdentifier = (playerObj: Player | Guest | PlayerRelated | PlayerOnTournament): number | string => {
  if ('guest_id' in playerObj) {
    return playerObj['guest_id'];
  } else {
    return playerObj.id;
  }
}