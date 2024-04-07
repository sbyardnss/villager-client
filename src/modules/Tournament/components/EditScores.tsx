import { alterGame } from "../../../ServerManager";
import { Game, OutgoingGame } from "../../../Types/Game";
import { Guest } from "../../../Types/Guest";
import { PlayerRelated } from "../../../Types/Player";
// import trophyIcon from "../../images/small_trophy_with_background.png";
// import { findIdentifier } from "../actions/find-identifier";

interface EditScoresProps {
  tourneyGames: Game[];
  resetGame: () => void;
  resetTourneyGames: () => void;
  gameForApi: Game | OutgoingGame;
  handleUpdate: (
    whitePlayer: PlayerRelated | Guest,
    blackPlayer: PlayerRelated | Guest,
    winner?: PlayerRelated | Guest | undefined,
    pastGame?: Game,
  ) => void;
  allClubMates: (PlayerRelated | Guest)[];
  handleReplaceGame: (game: Game, index: number) => void;
}

export const EditScores: React.FC<EditScoresProps> = ({
  tourneyGames,
  resetGame,
  resetTourneyGames,
  gameForApi,
  handleUpdate,
  allClubMates,
  handleReplaceGame,
}) => {
  const sortedGames = tourneyGames.sort((a: Game, b: Game) => a.id - b.id);
  return (
    <section id="tournamentEditSection">
      <section id="previousMatchups">
        {
          sortedGames.map((game: Game, index) => {
            if (!game.bye) {
              // let whiteTargetForIndicator;
              // if (game.player_w)
              //     whiteTargetForIndicator = findIdentifier(game.player_w);
              // let blackTargetForIndicator;
              // if (game.player_b)
              //     blackTargetForIndicator = findIdentifier(game.player_b);
              return (
                <div
                  key={`${game.tournament_round} + ${game.id} + editing`}
                  data-cy={`edit-score--round-${game.tournament_round}--gameId-${game.id}`}
                  className="editScoreListItem" >
                  <div>
                    <div className="setCustomFont">Round {game.tournament_round}</div>
                  </div>
                  <div className="editMatchup">
                    <div className={gameForApi.id === game.id && gameForApi.winner === game.player_w ? "selectedWhitePiecesMatchup" : "whitePiecesMatchup"}
                      id="whitePieces"
                      data-cy={`edit-score--white-win--round-${game.tournament_round}--gameId-${game.id}`}
                      onClick={() => {
                        // handleGameForApiUpdate(evt.target.id, white, black, game)
                        if (game.player_w && game.player_b)
                          handleUpdate(game.player_w, game.player_b, game.player_w, game);
                      }}>{game.player_w?.full_name}</div>
                    <div className={gameForApi.id === game.id && gameForApi.win_style === "draw" ? "selectedDrawMatchupButton" : "drawMatchupButton"}
                      id="drawUpdate"
                      data-cy={`edit-score--draw--round-${game.tournament_round}--gameId-${game.id}`}
                      onClick={(evt) => {
                        // handleGameForApiUpdate(evt.target.id, white, black, game)
                        if (game.player_w && game.player_b)
                          handleUpdate(game.player_w, game.player_b, undefined, game);
                      }}>Draw</div>
                    <div className={gameForApi.id === game.id && gameForApi.winner === game.player_b ? "selectedBlackPiecesMatchup" : "blackPiecesMatchup"}
                      id="blackPieces"
                      data-cy={`edit-score--black-win--round-${game.tournament_round}--gameId-${game.id}`}
                      onClick={(evt) => {
                        // handleGameForApiUpdate(evt.target.id, white, black, game)
                        if (game.player_w && game.player_b)
                          handleUpdate(game.player_w, game.player_b, game.player_b, game);
                      }}>{game.player_b?.full_name} </div>
                    <button
                      data-cy={`edit-score-submit-btn--round-${game.tournament_round}--gameId-${game.id}`}
                      onClick={() => {

                        alterGame(gameForApi)
                          .then(data => {
                            handleReplaceGame(data, index);
                          })
                        // resetGame();
                      }}>
                      submit
                    </button>
                  </div>
                </div>
              );
            } else {
              return null;
            }
          })
        }
      </section>
    </section>
  )

}