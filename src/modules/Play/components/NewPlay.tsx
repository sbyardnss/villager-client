import "./play.css";
import { Chessboard } from "react-chessboard";
import Chess from "chess.js";
import { useEffect, useState } from "react";
import { getMoveOptions } from "../actions/get-move-options";
import { useAppContext } from "../../App/AppProvider";
import { usePlayContext } from "../PlayController";
import { getMovesFromPGN } from "../actions/get-moves-from-pgn";
import { ResetOrStartBtns } from "./reset-start-buttons";
import { digitalGameDefaults } from "../../../Types/Game";
import { useNavigate } from "react-router-dom";
import { alterGame } from "../../../ServerManager";
export interface Move {
  from: string | null;
  to: string | null;
  promotion: 'q';
}
const moveDefaults: Move = {
  from: null,
  to: null,
  promotion: 'q',
}
export const NewPlay = () => {
  const navigate = useNavigate();
  const { localVillagerUser } = useAppContext();
  const { selectedGame, updateSelectedGame, usersActiveGames, setUsersActiveGames, resetUserGames,
    selectedRange, setSelectedRange, orientation, setOrientation, review, setReview, activePlayer } = usePlayContext()
  const [game, setGame] = useState(new Chess());
  // const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [matchReady, setMatchReady] = useState<boolean>(false);
  const [reviewPgn, setReviewPgn] = useState<string[]>([]);
  const [reviewLength, setReviewLength] = useState(0);
  const [playerMove, updatePlayerMove] = useState<Move>({ ...moveDefaults })
  useEffect(
    () => {
      console.log(game.pgn())
    }, [game]
  )
  useEffect(
    () => {
      console.log(selectedGame)
    }, [selectedGame]
  )
  useEffect(
    () => {
      console.log(selectedGame.pgn)
    }, [selectedGame.pgn]
  )
  useEffect(
    () => {
      document.addEventListener('click', leaveGame);

      // Clean up the event listener
      // return () => {
      //   document.removeEventListener('click', leaveGame);
      // };
    }, []
  )

  useEffect(
    () => {
      if (selectedGame) {
        if (selectedGame.pgn) {
          game.load_pgn(selectedGame.pgn);
        }
        setMatchReady(true);
      }
    }, [selectedGame]
  )
  useEffect(
    () => {
      const pgnArr: string[] = getMovesFromPGN(game);
      setReviewPgn(pgnArr);
      if (pgnArr.length) {
        setReviewLength(pgnArr.length);
      }
    }, [review, game]
  )

  useEffect(
    () => {
      if (playerMove.from) {
        const hasOptions: { hasOptions: boolean, newSquares: any } = getMoveOptions(playerMove.from, game);
        setOptionSquares(hasOptions.newSquares);
      }
      if (playerMove.from && playerMove.to) {
        makeAMove({
          from: playerMove.from,
          to: playerMove.to,
          promotion: "q", // always promote to a queen for example simplicity
        });
        const newPgn = game.pgn();
        const gameCopy = { ...selectedGame };
        gameCopy.pgn = newPgn;
        updateSelectedGame(gameCopy);
        alterGame(gameCopy);
        resetMove();
        setOptionSquares({});
      }
    }, [playerMove]
  )

  function resetMove() {
    updatePlayerMove({ ...moveDefaults });
  }

  function resetGame() {
    game.reset(); //TODO: DO WE WANT THIS
    setOptionSquares({});
    resetMove();
  }

  function makeAMove(move: any) {
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    setGame(gameCopy);
    return result; // null if the move was illegal, the move object if the move was legal
  }

  // function makeRandomMove() {
  //   const possibleMoves = game.moves();
  //   if (game.game_over() || game.in_draw() || possibleMoves.length === 0)
  //     return; // exit if the game is over
  //   const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  //   makeAMove(possibleMoves[randomIndex]);
  // }

  function onDrop(sourceSquare: any, targetSquare: any) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return false;
    // setTimeout(makeRandomMove, 200);
    return true;
  }

  const handleSquareClick = (square: any) => {
    if (!playerMove.from) {
      updatePlayerMove({ ...playerMove, from: square });
    } else {
      updatePlayerMove({ ...playerMove, to: square });
    }
  }
  const leaveGame = (e: Event) => {
    if (e.target) {
      const target = e.target as HTMLElement;

      if (document.getElementById("navMenu")?.contains(target)) {
        if (target.className !== "menu-btn" && target.id !== "inactive" && target.id !== "active" && target.id !== "navMenu" && target.id !== "navLinks" && target.id !== "logo" && target.className !== "" && target.id !== "play") {
          updateSelectedGame({ ...digitalGameDefaults });
          document.removeEventListener('click', leaveGame);
          // setReview(false)
          navigate((e.target as HTMLElement).id);
        }
      }
      if (target.id === "logout") {
        updateSelectedGame(digitalGameDefaults);
        // setReview(false);
        localStorage.removeItem("villager");
        document.removeEventListener('click', leaveGame);
        navigate("/", { replace: true });
      }
    }
  }

  // console.log(Object.keys(<Chessboard />))

  return <>
    <div id="playContainer">
      <div id="boardInterface">
        <Chessboard
          animationDuration={300}
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={(evt: any) => {
            handleSquareClick(evt);
          }}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
          customSquareStyles={{
            ...moveSquares,
            ...optionSquares,
          }} />
        <ResetOrStartBtns
          selectedGame={selectedGame}
          matchReady={matchReady}
          handleGameReset={resetGame}
          review={review}
          reviewLength={reviewLength}
          setReviewLength={setReviewLength}
          reviewPgn={reviewPgn}
        />
      </div>
    </div>
  </>
}
