import type { Player, PlayerRelated } from "../Types/Player";
import type { Guest } from "../Types/Guest";
export const isPlayerOrGuest = (playerOrGuestObj: Guest | PlayerRelated): boolean => {
  return !('guest_id' in playerOrGuestObj);
}