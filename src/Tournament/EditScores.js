import { useContext } from "react"
import { TournamentContext } from "./TournamentProvider"
import { alterGame } from "../ServerManager"


export const EditScores = ({ allPlayersArr, handleGameForApiUpdate, setEditScores, gameForApi }) => {
    const { tournamentGames, resetTournamentGames } = useContext(TournamentContext)
    const sortedTournamentGames = tournamentGames.sort((a, b) => { return a.id - b.id })
    return (
        <section id="tournamentEditSection">
            <button className="buttonStyleReject" id="cancelEditBtn" onClick={() => setEditScores(false)}>cancel edit</button>
            <section id="previousMatchups">
                {
                    sortedTournamentGames.map(game => {
                        const white = allPlayersArr.find(player => {
                            if (game.player_w.guest_id) {
                                return player.guest_id === game.player_w.guest_id
                            }
                            else {
                                return player.id === game.player_w.id
                            }
                        })
                        const black = allPlayersArr.find(player => {
                            if (game.player_b?.guest_id) {
                                return player.guest_id === game.player_b?.guest_id
                            }
                            else {
                                return player.id === game.player_b?.id
                            }
                        })
                        const whiteTargetForIndicator = white?.guest_id ? white?.guest_id : white?.id
                        const blackTargetForIndicator = black?.guest_id ? black?.guest_id : black?.id
                        if (game.bye === false) {
                            return (
                                <div key={`${game.tournament_round} + ${game.id} + editing`} className="editScoreListItem">
                                    <div>
                                        <div className="setCustomFont">Round {game.tournament_round}</div>
                                    </div>
                                    <div className="editMatchup">
                                        <div className={gameForApi.id === game.id && gameForApi.winner === whiteTargetForIndicator ? "selectedWhitePiecesMatchup" : "whitePiecesMatchup"}
                                            id="whitePieces"
                                            onClick={(evt) => {
                                                handleGameForApiUpdate(evt.target.id, white, black, game)
                                                // }}>{white?.username || white?.full_name}</div>
                                            }}>{white?.full_name}</div>
                                        <div className={gameForApi.id === game.id && gameForApi.win_style === "draw" ? "selectedDrawMatchupButton" : "drawMatchupButton"}
                                            id="drawUpdate"
                                            onClick={(evt) => {
                                                handleGameForApiUpdate(evt.target.id, white, black, game)
                                            }}>Draw</div>
                                        <div className={gameForApi.id === game.id && gameForApi.winner === blackTargetForIndicator ? "selectedBlackPiecesMatchup" : "blackPiecesMatchup"}
                                            id="blackPieces"
                                            onClick={(evt) => {
                                                handleGameForApiUpdate(evt.target.id, white, black, game)
                                            }}>{black?.full_name}</div>
                                        <button onClick={() => {
                                            alterGame(gameForApi)
                                                .then(() => resetTournamentGames())
                                        }}>
                                            submit
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    })
                }
            </section>
        </section>
    )
}