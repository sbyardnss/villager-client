export const getMoveOptions = (square: string, game: any) => {
  //TODO-ANY
  const moves = game.moves({
    square,
    verbose: true,
  });
  if (moves.length === 0) {
    return false;
  }
  const newSquares = {};
  moves.map((move: any) => {
    (newSquares as any)[move.to] = {
      background:
        game.get(move.to) && game.get(move.to).color !== game.get(square).color
          ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
          : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
      borderRadius: "50%",
    };
    return move;
  });
  (newSquares as any)[square] = {
    background: "rgba(255, 255, 0, 0.4)",
  };
  // setOptionSquares(newSquares);
  return [true, newSquares];
}