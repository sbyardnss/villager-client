import { PlayerRelated } from "../../../Types/Player";
import { Guest, Player } from "../Types"

export const findIdentifier = (playerObj: Player | Guest | PlayerRelated): number | string => {
  if ('guest_id' in playerObj) {
    return playerObj['guest_id'];
  } else {
    return playerObj.id;
  }
}