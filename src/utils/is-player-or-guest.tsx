import type { Guest, Player, PlayerOnTournament } from "../modules/Tournament/Types"

export const isPlayerOrGuest = (playerOrGuestObj: Player | Guest | PlayerOnTournament): boolean => {
  return !('guest_id' in playerOrGuestObj);
}