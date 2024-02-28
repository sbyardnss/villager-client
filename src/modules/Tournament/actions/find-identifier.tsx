import { Guest, Player } from "../Types"

export const findIdentifier = (playerObj: Player | Guest) => {
  if ('guest_id' in playerObj) {
    return playerObj['guest_id'];
  } else {
    return playerObj.id;
  }
}