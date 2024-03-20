export const getMovesFromPGN = (game: any) => {
  //.pgn() give game history
  const pgn = game.pgn();
  const splitBySpacesInitial = pgn?.split(" ");
  const pgnArray = [];
  for (let i = 0; i < splitBySpacesInitial.length; i = i + 3) {
    const whitePiecesMove = splitBySpacesInitial[i + 1];
    const blackPiecesMove = splitBySpacesInitial[i + 2];
    if (blackPiecesMove) {
      pgnArray.push(whitePiecesMove);
      pgnArray.push(blackPiecesMove);
    }
    else {
      pgnArray.push(whitePiecesMove);
    }
  }
  return pgnArray
}