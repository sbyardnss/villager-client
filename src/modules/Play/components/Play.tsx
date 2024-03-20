import "../../../styles/Play.css";
import { usePlayContext } from "../PlayController";
import { useAppContext } from "../../App/AppProvider";
import { alterGame, getAIMove, sendNewGame } from "../../../ServerManager";
import { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import Chess from "chess.js";
import { type DigitalGame, digitalGameDefaults } from "../../../Types/Game";
import { useNavigate } from "react-router-dom";
import { findByIdentifier } from "../../Tournament/actions/find-by-identifier";
import { getMovesFromPGN } from "../actions/get-moves-from-pgn";
import { pgnStringBuilder } from "../actions/pgn-string-builder";
import { getMoveOptions } from "../actions/get-move-options";

export const Play = () => {
  const { localVillagerUser, clubMatesAndGuests } = useAppContext();
  const { selectedGame, updateSelectedGame, orientation, review, setReview, resetUserGames } = usePlayContext();
  const navigate = useNavigate();
  const [game, setGame] = useState(new Chess());
  const [matchReady, setMatchReady] = useState(false);
  const [reviewPgn, setReviewPgn] = useState<string[]>([]);
  const [reviewLength, setReviewLength] = useState(0);
  const [stringPgn, setStringPgn] = useState<string>("");
  const [gameForApi, updateGameForApi] = useState<DigitalGame>(digitalGameDefaults);
  const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  // useEffect(
  //   () => {
  //     console.log(game.turn())
  //   }, [game]
  // )
  useEffect(
    () => {
      if (selectedGame) {
        if (selectedGame.pgn) {
          game.load_pgn(selectedGame.pgn);
        }
        updateGameForApi(selectedGame);
        setMatchReady(true);
      } else {
        const copy: DigitalGame = { ...digitalGameDefaults };
        if (orientation === "black") {
          const userObject = findByIdentifier(localVillagerUser.userId, clubMatesAndGuests);
          if (userObject) {
            copy.player_b = userObject;
            copy.player_w = null
            // copy.computer_opponent = true
            updateGameForApi(copy)
          }
        }
        else {
          copy.player_w = localVillagerUser.userId;
          copy.player_b = null;
          // copy.computer_opponent = true;
          updateGameForApi(copy)
        }
      }

    }, [selectedGame, orientation, game, clubMatesAndGuests, localVillagerUser]
  )

  useEffect(
    () => {
      if (selectedGame.id) {
        if (selectedGame.winner === null) {
          if (game.game_over()) {
            const copy = { ...selectedGame };
            copy.pgn = game.pgn();
            if (game.in_checkmate()) {
              if (game.turn() === "b") {
                copy.winner = selectedGame.player_w;
                copy.winner_model_type = 'player';
              } else {
                copy.winner = selectedGame.player_b;
                copy.winner_model_type = 'player';
              }
              copy.win_style = 'checkmate';
            } else {
              copy.win_style = "draw";
            }
            updateGameForApi(copy);
            if (selectedGame.id) {
              //TODO-COMMENT
              // alterGame(copy);
            }
          }
        }
      }
    }, [game, selectedGame]
  )

  useEffect(
    () => {
      if (review) {
        const pgnArr: string[] = getMovesFromPGN(game);
        setReviewPgn(pgnArr);
        if (pgnArr.length) {
          setReviewLength(pgnArr.length);
        }
      }
    }, [review, game, /*selectedGame*/]
  )

  useEffect(
    () => {
      if (reviewLength > 0) {
        const newPgn = [...reviewPgn];
        const stringPgn = pgnStringBuilder(newPgn, reviewLength);
        setStringPgn(stringPgn);
        game.load_pgn(stringPgn);
      }
    }, [reviewLength, reviewPgn, game]
  )
  //  TODO: DO WE NEED THIS?
  const safeGameMutate = (modify: any) => {
    console.log('modify', modify)
    setGame((g: any) => {
      console.log('g', g)
      const update = { ...g };
      modify(update);
      return update;
    });
  }
  const onSquareClick = (square: any) => {
    // console.log('square', square)
    // setRightClickedSquares({});
    console.log('outer square', square)
    function resetFirstMove(square: any) {
      console.log('square', square)
      // console.log('within move reset')
      const hasOptions: { hasOptions: boolean, newSquares: any } = getMoveOptions(square, game) ;
      setOptionSquares(hasOptions.newSquares);
      console.log('gamemoves in component', game.moves({
        square,
        verbose: true,
      }))
      console.log('hasOptions', hasOptions)
      if (hasOptions.hasOptions) setMoveFrom(square);
    }
    // from square
    if (!moveFrom) {
      // console.log('in !moveFrom')
      resetFirstMove(square);
      return;
    }
    // attempt to make move
    // const gameCopy = { ...game };
    // const move = gameCopy.move({
    //   from: moveFrom,
    //   to: square,
    //   promotion: "q", // TODO: CURRENTLY PROMOTING TO QUEEN ONLY. always promote to a queen for example simplicity
    // });
    // const gameCopy = { ...game };
    const move = game.move({
      from: moveFrom,
      to: square,
      promotion: "q", // TODO: CURRENTLY PROMOTING TO QUEEN ONLY. always promote to a queen for example simplicity
    });
    // console.log('move', move)
    // console.log('gameCopy', gameCopy)
    // console.log('gameCopy.moves()', gameCopy.moves())
    // setGame(gameCopy);
    // if invalid, setMoveFrom and getMoveOptions
    if (move === null) {
      resetFirstMove(square);
      return;
    }
    setMoveFrom("");
    setOptionSquares({});
    const newGame = new Chess(game.pgn());
    setGame(newGame);
  }
  const resetOrStartGame = () => {
    if (!selectedGame.id) {
      if (matchReady) {
        return (
          <div>
            <button
              className="buttonStyleApprove playBtns"
              onClick={() => {
                safeGameMutate((game: any) => {
                  game.reset();
                });
                setMoveSquares({});
              }}
            >reset</button>
          </div>
        )
      }
      else {
        return null
      }
    }
    else {
      if (review === true) {
        return (
          <div>
            <button className="reviewButtons"
              onClick={() => {
                setReviewLength(reviewLength - 1)
              }}>&lt;</button>
            <button className="reviewButtons"
              onClick={() => {
                if (reviewLength < reviewPgn.length) {
                  setReviewLength(reviewLength + 1)
                }
              }}>&gt;</button>
          </div>
        )
      }
    }
  }
  const leaveGame = (e: Event) => {
    if (e.target) {
      const target = e.target as HTMLElement;

      if (document.getElementById("navMenu")?.contains(target)) {
        if (target.className !== "menu-btn" && target.id !== "inactive" && target.id !== "active" && target.id !== "navMenu" && target.id !== "navLinks" && target.id !== "logo" && target.className !== "" && target.id !== "play") {
          updateSelectedGame(digitalGameDefaults);
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
  document.addEventListener('click', leaveGame);

  return (
    <main id="playContainer">
      {!selectedGame.id && !matchReady ?
        <div id="clickStartPrompt"
          onClick={() => setMatchReady(true)}>
          <div>Start Game</div>
        </div>
        : ""}
      {!selectedGame.id ?
        game.in_check() ?
          <div>check</div> :
          game.game_over() && game.in_checkmate() ?
            <div id="checkmatePrompt">
              <div>checkmate</div>
              <button onClick={() => {
                updateSelectedGame(digitalGameDefaults);
                navigate("/");
              }}>
                exit game
              </button>
            </div>
            : ""
        : ""}
      <div id="boardInterface">
        <Chessboard
          // key={game.fen()}
          id="ClickToMove"
          animationDuration={200}
          arePiecesDraggable={false}
          boardOrientation={orientation}
          position={game.fen()}
          onSquareClick={(evt) => {
            console.log('hitting')
            console.log('evt', evt)
            if (matchReady) {
              onSquareClick(evt)
              if (selectedGame.id) {
                console.log('getting past if')
                const gameCopy = { ...selectedGame }
                const newPgn = game.pgn();
                gameCopy.pgn = newPgn;
                alterGame(gameCopy)
                  .then(() => resetUserGames());
              }
            }
          }}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
          customSquareStyles={{
            ...moveSquares,
            ...optionSquares,
          }}
        />
        <div id="playControls" >
          {resetOrStartGame()}
          <button
            className="buttonStyleApprove playBtns"
            onClick={() => {
              safeGameMutate((game: any) => {
                game.undo();

              });
              setMoveSquares({});
            }}
          >
            undo
          </button>
          <button

            className="buttonStyleReject playBtns"
            onClick={() => {
              updateSelectedGame(digitalGameDefaults)
              navigate(-1)
            }}>
            exit game
          </button>
        </div>
      </div>
    </main>
  )
}