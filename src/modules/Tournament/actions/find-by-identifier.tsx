import { Guest } from "../../../Types/Guest";
import type { PlayerRelated } from "../../../Types/Player";

//TODO: NEED ANY HERE IN ORDER TO USE isNaN?
export const findByIdentifier = (identifier: any, playerArr: (PlayerRelated | Guest)[]) => {
  // if (typeof identifier === 'string') {
  if (isNaN(parseInt(identifier))) {
    return playerArr.find(p => (p as Guest).guest_id === identifier);
  } else {
    return playerArr.find(p => p.id === parseInt(identifier));
  }
}