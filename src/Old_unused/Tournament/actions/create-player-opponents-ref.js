

export function createPlayerOpponentReferenceObject(pairingArr) {
  let opponentObj = {};
  pairingArr.forEach(pairing => {
    if (!opponentObj[pairing?.player1] && pairing.player1) {
      opponentObj[pairing.player1] = [];
    }
    if (!opponentObj[pairing.player2] && pairing.player2) {
      opponentObj[pairing.player2] = []
    }
    const player2orBye = pairing.player2 ? pairing.player2 : 'bye'
    if (opponentObj[pairing.player1]) {
      opponentObj[pairing.player1].push(player2orBye);
    }
    if (pairing.player2) {
      if (opponentObj[pairing.player2]) {
        opponentObj[pairing.player2].push(pairing.player1);
      }
    };
  })
  return opponentObj;
}