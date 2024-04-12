import { Match } from "tournament-pairings/dist/Match";
import { PlayerRelated } from "../../../Types/Player";
import { Guest } from "../../../Types/Guest";
import { findIdentifier } from "./find-identifier";


type CreatePairingForTwoPlayersFunction = (
  players: (PlayerRelated | Guest)[],
  targetRound: number,
) => Match;

export const createPairingForTwoPlayers: CreatePairingForTwoPlayersFunction = (
  players,
  targetRound,
) => {
  const randomWhite = Math.floor(Math.random() * 2)
  const whitePlayer = findIdentifier(players.splice(randomWhite, 1)[0])
  const blackPlayer = findIdentifier(players[0])
  const newMatchup: Match = {
    round: targetRound,
    match: 1,
    player1: whitePlayer,
    player2: blackPlayer,
  };
  return newMatchup;
}