import { useContext } from "react";
import { AppContext } from "../../App/AppProvider";
import { checkIfUserIsAppCreator } from "../actions/check-if-creator";
import { findIdentifier } from "../actions/find-identifier";
// import { sendNewGame } from "../../../ServerManager";
import type { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import type { PlayerRelated } from "../../../Types/Player";
import type { Guest } from "../../../Types/Guest";
import type { Tournament } from "../../../Types/Tournament";
import type { Match } from "tournament-pairings/dist/Match";
import type { OutgoingGame, Game } from "../../../Types/Game";

interface ScoringProps {
  tournamentObj: Tournament;
  tourneyGames: Game[];
  currentMatches: Match[];
  //TODO: FIX PLAYERRELATEDISSUE
  byeGame: any;
  resetGame: () => void;
  resetTourneyGames: () => void;
  isTourneyCreator: boolean;
  round: number;
  activePlayers: (PlayerRelated | Guest)[];
  analysis: tournamentAnalysisOutput;
  //TODO: FIX PLAYERRELATEDISSUE
  gameForApi: OutgoingGame;
  handleUpdate: (
    whitePlayer: PlayerRelated | Guest,
    blackPlayer: PlayerRelated | Guest,
    winner?: PlayerRelated | Guest | undefined,
    pastGame?: Game
  ) => void;
}

export const Scoring: React.FC<ScoringProps> = ({
  tournamentObj,
  tourneyGames,
  currentMatches,
  byeGame,
  resetGame,
  resetTourneyGames,
  isTourneyCreator,
  round,
  activePlayers,
  analysis,
  gameForApi,
  handleUpdate,
}) => {
  // const { localVillagerUser } = useContext(AppContext);
  if (tournamentObj.in_person && (isTourneyCreator || checkIfUserIsAppCreator())) {
    return (
      <section id="tournamentScoringSection">
        {byeGame.current ?
          <div key={`${byeGame.current.round} -- ${byeGame.current.match} -- bye`} className="setColor setCustomFont">
            {byeGame.current.player_w.full_name} has bye
          </div>
          : ""}
        {
          currentMatches.map((matchup, index) => {
            const whitePlayer = activePlayers.find(player => findIdentifier(player) === matchup.player1);
            const blackPlayer = activePlayers.find(player => findIdentifier(player) === matchup.player2);
            const matchingGame = tourneyGames.find(tg => tg.player_w === whitePlayer && tg.player_b === blackPlayer && tg.tournament_round === round && tg.tournament === tournamentObj.id);
            if (whitePlayer && blackPlayer && !matchingGame?.winner && matchingGame?.win_style !== 'draw' && analysis.playerOppRefObj[findIdentifier(whitePlayer)]?.indexOf(findIdentifier(blackPlayer)) !== analysis.playerOppRefObj[findIdentifier(whitePlayer)]?.length + 1) {
              return (
                <div key={`${matchup.round} -- ${matchup.match} -- ${index}`}
                  className="tournamentScoringMatchup">
                  <div
                    className={gameForApi.id === undefined && gameForApi.winner === whitePlayer ? "selectedWhitePiecesMatchup" : "whitePiecesMatchup"}
                    id="whitePieces"
                    onClick={() => {
                      handleUpdate(whitePlayer, blackPlayer, whitePlayer);
                    }}>{whitePlayer.full_name}
                  </div>
                  <div
                    className={gameForApi.id === undefined && gameForApi.player_w === whitePlayer && gameForApi.player_b === blackPlayer && gameForApi.win_style === "draw" ? "selectedDrawMatchupButton" : "drawMatchupButton"}
                    id="drawUpdate"
                    onClick={() => {
                      handleUpdate(whitePlayer, blackPlayer);
                    }}>Draw
                  </div>
                  <div
                    className={gameForApi.id === undefined && gameForApi.winner === blackPlayer ? "selectedBlackPiecesMatchup" : "blackPiecesMatchup"}
                    id="blackPieces"
                    onClick={() => {
                      handleUpdate(whitePlayer, blackPlayer, blackPlayer);
                    }}>{blackPlayer.full_name}
                  </div>
                  <button
                    id="scoringSubmit"
                    className="buttonStyleReject"
                    onClick={() => {
                      if (gameForApi.win_style) {
                        console.log(gameForApi);
                        // sendNewGame(gameForApi)
                        //   .then(() => resetTournamentGames())
                        // resetGameForApi()
                      }
                    }}>
                    submit
                  </button>
                </div>
              )
            }
            return (
              <div key={`${matchup.round} -- ${matchup.match} -- ${index}`}>
                {matchup.player1}
              </div>
            )
          })
        }
      </section>
    )
  } else {
    return (
      <section id="tournamentScoringSection">
        {byeGame.current ?
          <div key={`${byeGame.current.round} -- ${byeGame.current.match} -- bye`} className="setColor setCustomFont">
            {byeGame.current.player_w.full_name} has bye
          </div>
          : ""}
      </section>
    )
  }
}