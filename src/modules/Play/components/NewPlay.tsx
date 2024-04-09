import "./play.css";
import { Chessboard } from "react-chessboard";
import Chess from "chess.js";
import { useEffect, useState } from "react";
import { getMoveOptions } from "../actions/get-move-options";

export const NewPlay = () => {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});

  // useEffect(
  //   () => {
  //     console.log(game.pgn())
  //   }, [game]
  // )

  function makeAMove(move: any) {
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    setGame(gameCopy);
    return result; // null if the move was illegal, the move object if the move was legal
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0)
      return; // exit if the game is over
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    makeAMove(possibleMoves[randomIndex]);
  }

  function onDrop(sourceSquare: any, targetSquare: any) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return false;
    setTimeout(makeRandomMove, 200);
    return true;
  }

  const onSquareClick = (square: any) => {
    function resetFirstMove(square: any) {
      const hasOptions: { hasOptions: boolean, newSquares: any } = getMoveOptions(square, game);
      setOptionSquares(hasOptions.newSquares);
      if (hasOptions.hasOptions) {
        setMoveFrom(square)
      }
    }
    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }
    const move = game.move({
      from: moveFrom,
      to: square,
      promotion: "q", // TODO: CURRENTLY PROMOTING TO QUEEN ONLY. always promote to a queen for example simplicity
    });
    if (move === null) {
      resetFirstMove(square);
      return;
    }
    setTimeout(makeRandomMove, 200);
    setMoveFrom("");
    setOptionSquares({});
    const newGame = new Chess(game.fen());
    setGame(newGame);
  }
  console.log(Object.keys(<Chessboard />))

  return <>
    <div id="playContainer">
      <div id="boardInterface">
        <Chessboard
          animationDuration={200}
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={(evt: any) => {
            onSquareClick(evt);
          }} 
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
          customSquareStyles={{
            ...moveSquares,
            ...optionSquares,
          }} />

      </div>
    </div>
  </>
}
