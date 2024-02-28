import type { Match } from "tournament-pairings/dist/Match";

export function createPlayerOpponentReferenceObject(pairingArr: Match[]) {
  let opponentObj: { [key: string | number]: (string | number)[] } = {};
  pairingArr.forEach(pairing => {

    if (pairing.player1 && !opponentObj[pairing.player1]) {
      opponentObj[pairing.player1] = [];
    };
    if (pairing.player2 && !opponentObj[pairing.player2]) {
      opponentObj[pairing.player2] = []
    };
    const player2orBye = pairing.player2 ? pairing.player2 : 'bye';
    if (pairing.player1 && opponentObj[pairing.player1]) {
      opponentObj[pairing.player1].push(player2orBye);
    };
    if (pairing.player2 && opponentObj[pairing.player2]) {
      if (pairing.player1)
        opponentObj[pairing.player2].push(pairing.player1);
    };

  })
  return opponentObj;
}

