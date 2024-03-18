import { usePlayContext } from "../PlayController";
// import { useAppContext } from "../../App/AppProvider";
import { alterGame, getAIMove, sendNewGame } from "../../../ServerManager";
import { useContext, useState, useEffect, MouseEvent } from "react";
import { Chessboard } from "react-chessboard"
import Chess from "chess.js";
import { Game, OutgoingGame } from "../../../Types/Game";
import { Guest } from "../../../Types/Guest";
import { PlayerRelated } from "../../../Types/Player";
import { useNavigate } from "react-router-dom";

export const Play = () => {
  // const { localVillagerUser } = useAppContext();
  const { selectedGame, updateSelectedGame, orientation } = usePlayContext();
  const navigate = useNavigate();
  const [game, setGame] = useState(new Chess());
  const [matchReady, setMatchReady] = useState(false);

  const gameDefaults: OutgoingGame = {
    id: undefined,
    player_w: {} as Guest | PlayerRelated,
    player_w_model_type: "",
    player_b: {} as Guest | PlayerRelated,
    player_b_model_type: "",
    tournament: 0,
    time_setting: 0,
    win_style: "",
    accepted: true,
    tournament_round: 0,
    winner: {} as Guest | PlayerRelated,
    winner_model_type: "",
    bye: false,
    computer_opponent: true,
    pgn: "",
  }
  const [gameForApi, updateGameForApi] = useState<OutgoingGame | Game>(gameDefaults);

  useEffect(
    () => {
      if (selectedGame) {
        if (selectedGame.pgn) {
          game.load_pgn(selectedGame.pgn);
        }
        updateGameForApi(selectedGame);
        setMatchReady(true);
      }

    }, [selectedGame, orientation, game]
  )
  const leaveGame = (e: Event) => {
    if (e.target) {
      const target = e.target as HTMLElement;

      if (document.getElementById("navMenu")?.contains(target)) {
        if (target.className !== "menu-btn" && target.id !== "inactive" && target.id !== "active" && target.id !== "navMenu" && target.id !== "navLinks" && target.id !== "logo" && target.className !== "" && target.id !== "play") {
          updateSelectedGame(gameDefaults);
          document.removeEventListener('click', leaveGame);
          // setReview(false)
          navigate((e.target as HTMLElement).id);
        }
      }
      if (target.id === "logout") {
        updateSelectedGame(gameDefaults);
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