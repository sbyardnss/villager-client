import { usePlayContext } from "../PlayController";
import { useAppContext } from "../../App/AppProvider";
import { alterGame, getAIMove, sendNewGame } from "../../../ServerManager";
import { useContext, useState, useEffect, MouseEvent } from "react";
import { Chessboard } from "react-chessboard";
import Chess from "chess.js";
import { type DigitalGame, digitalGameDefaults } from "../../../Types/Game";
import { useNavigate } from "react-router-dom";
import { findByIdentifier } from "../../Tournament/actions/find-by-identifier";
import { getMovesFromPGN } from "../actions/get-moves-from-pgn";
import { pgnStringBuilder } from "../actions/pgn-string-builder";

export const Play = () => {
  const { localVillagerUser, clubMatesAndGuests } = useAppContext();
  const { selectedGame, updateSelectedGame, orientation, review, setReview } = usePlayContext();
  const navigate = useNavigate();
  const [game, setGame] = useState(new Chess());
  const [matchReady, setMatchReady] = useState(false);
  const [reviewPgn, setReviewPgn] = useState<string[]>([]);
  const [reviewLength, setReviewLength] = useState(0);
  const [stringPgn, setStringPgn] = useState<string>("");
  const [gameForApi, updateGameForApi] = useState<DigitalGame>(digitalGameDefaults);

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

  return <></>
}