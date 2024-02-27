import type { Player, PlayerOnTournament, Guest } from "../modules/Tournament/Types";

export const getPlayerType = (player: Player | PlayerOnTournament | Guest) => {
  if ('guest_id' in player) {
    return 'Guest';
  } else if ('my_clubs' in player) {
    return 'Player';
  } else {
    return 'PlayerOnTournament';
  }
}