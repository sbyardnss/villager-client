import { checkIfUserIsAppCreator } from "../actions/check-if-creator";
import { findIdentifier } from "../actions/find-identifier";
// import { sendNewGame } from "../../../ServerManager";
import type { tournamentAnalysisOutput } from "../actions/matchup-game-analysis";
import type { PlayerRelated } from "../../../Types/Player";
import type { Guest } from "../../../Types/Guest";
import type { Tournament } from "../../../Types/Tournament";
import type { Match } from "tournament-pairings/dist/Match";
import type { OutgoingGame, Game } from "../../../Types/Game";
import { sendNewGame } from "../../../ServerManager";

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
  const byeMatchup = currentMatches?.find(matchup => matchup.player1 === null || matchup.player2 === null);
  const whiteBye = byeGame.current.player_w.full_name;

  if (tournamentObj.in_person && (isTourneyCreator || checkIfUserIsAppCreator())) {
    return (
      <section id="tournamentScoringSection">
        {byeGame.current ?
          <div key={`${byeGame.current.round} -- ${byeGame.current.match} -- bye`} className="setColor setCustomFont">
            {byeGame.current.player_w.full_name} has bye
          </div>
          : ""}
        {byeMatchup !== undefined && tourneyGames.filter(tg => tg.tournament_round === round).length + 1 === currentMatches.length ?
          <div className="setCustomFont">Round complete. Start new round.</div> :
          byeMatchup === undefined && tourneyGames.filter(tg => tg.tournament_round === round).length === currentMatches.length ?
            <div className="setCustomFont">Round complete. Start new round.</div> :
            ""}
        {
          currentMatches.map((matchup, index) => {
            const whitePlayer = activePlayers.find(player => findIdentifier(player) === matchup.player1);
            const blackPlayer = activePlayers.find(player => findIdentifier(player) === matchup.player2);
            if (whitePlayer && blackPlayer && matchup.player1 && matchup.player2) {
              const matchingGame = tourneyGames.find(tg => {
                if (tg.player_w && tg.player_b) {
                  return findIdentifier(tg.player_w) === findIdentifier(whitePlayer) && findIdentifier(tg.player_b) === findIdentifier(blackPlayer) && tg.tournament_round === round && tg.tournament === tournamentObj.id
                } else {
                  return undefined;
                }
              });
              if (!matchingGame && analysis.playerOppRefObj[findIdentifier(whitePlayer)]?.indexOf(findIdentifier(blackPlayer)) !== analysis.playerOppRefObj[findIdentifier(whitePlayer)]?.length + 1) {
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
                          sendNewGame(gameForApi)
                            .then(() => resetTourneyGames());
                          resetGame();
                        }
                      }}>
                      submit
                    </button>
                  </div>
                )
              }
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
        {byeMatchup ?
          <div key={`${byeMatchup.round} -- ${byeMatchup.match} -- bye`} className="setColor setCustomFont">
            {whiteBye?.full_name} has bye
          </div>
          : ""}
        {
          currentMatches.map(matchup => {
            const white = activePlayers.find((player: PlayerRelated | Guest) => player.id === matchup.player1 || (player as Guest).guest_id === matchup.player1)
            const black = activePlayers.find((player: PlayerRelated | Guest) => player.id === matchup.player2 || (player as Guest).guest_id === matchup.player2)
            if (black !== undefined) {
              return (
                <div key={`${matchup.round} -- ${matchup.match}`}
                  className="tournamentScoringMatchup">
                  <div
                    className="whitePiecesMatchup"
                    id="whitePieces">
                    {white?.full_name}
                  </div>
                  <div className="setCustomFont">
                    Vs
                  </div>
                  <div
                    className="blackPiecesMatchup"
                    id="blackPieces">
                    {black.full_name}
                  </div>
                </div>
              )
            } else {
              return null;
            }
          })
        }
      </section>
    )
  }
}