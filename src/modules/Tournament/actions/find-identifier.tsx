import type { PlayerRelated, Player } from "../../../Types/Player";
import type { Guest } from "../../../Types/Guest";

export const findIdentifier = (playerObj: Guest | PlayerRelated): number | string => {

    if ('guest_id' in playerObj) {
      return playerObj['guest_id'];
    } else {
      return playerObj.id;
    }
}