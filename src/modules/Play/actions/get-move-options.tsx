export const getMoveOptions = (square: string, game: any) => {
  //TODO-ANY
  const moves = game.moves({
    square,
    verbose: true,
  });
  if (moves.length === 0) {
    return { hasOptions: false, newSquares: {} };
  }
  const newSquares = {};
  const updatedMoves = moves.map((move: any) => {
    return {
      ...move,
    };
  });
  updatedMoves.forEach((move: any) => {
    (newSquares as any)[move.to] = {
      background: game.get(move.to) && game.get(move.to).color !== game.get(square).color
        ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
        : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
      borderRadius: "50%",
    };
  });
  (newSquares as any)[square] = {
    background: "rgba(255, 255, 0, 0.4)",
  };

  return {
    hasOptions: true,
    newSquares: newSquares,
  }
}