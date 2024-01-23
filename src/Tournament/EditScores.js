import { useContext } from "react"
import { TournamentContext } from "./TournamentProvider"
import { alterGame } from "../ServerManager"
import trophyIcon from "../images/small_trophy_with_background.png"


export const EditScores = ({ allPlayersArr, handleGameForApiUpdate, setEditScores, gameForApi, resetGameForApi }) => {
    const { tournamentGames, resetTournamentGames, findIdentifier, clubPlayers, clubGuests } = useContext(TournamentContext)
    const sortedTournamentGames = tournamentGames.sort((a, b) => { return a.id - b.id })
    return (
        <section id="tournamentEditSection">
            <section id="previousMatchups">
                {
                    sortedTournamentGames.map(game => {
                        const whiteIdentifier = findIdentifier(game.player_w)
                        const blackIdentifier = findIdentifier(game?.player_b)
                        let white = {}
                        let black = {}
                        if (isNaN(parseInt(whiteIdentifier))) {
                            white = clubGuests.find(guest => guest.guest_id === whiteIdentifier)
                        }
                        else {
                            white = clubPlayers.find(player => player.id === whiteIdentifier)
                        }
                        if (isNaN(parseInt(blackIdentifier))) {
                            black = clubGuests.find(guest => guest.guest_id === blackIdentifier)
                        }
                        else {
                            black = clubPlayers.find(player => player.id === blackIdentifier)
                        }
                        const whiteTargetForIndicator = white?.guest_id ? white?.guest_id : white?.id
                        const blackTargetForIndicator = black?.guest_id ? black?.guest_id : black?.id
                        if (game.bye === false) {
                            return (
                                <div key={`${game.tournament_round} + ${game.id} + editing`} className="editScoreListItem">
                                    <div>
                                        <div className="setCustomFont">Round {game.tournament_round}</div>
                                    </div>
                                    {/* {winnerIdentifier === whiteIdentifier ? <img className="editScoresTrophy" src={trophyIcon} />: ""} */}
                                    <div className="editMatchup">
                                        <div className={gameForApi.id === game.id && gameForApi.winner === whiteTargetForIndicator ? "selectedWhitePiecesMatchup" : "whitePiecesMatchup"}
                                            id="whitePieces"
                                            onClick={(evt) => {
                                                handleGameForApiUpdate(evt.target.id, white, black, game)
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
                                            }}>{black?.full_name} </div>
                                        <button onClick={() => {
                                            alterGame(gameForApi)
                                                .then(() => resetTournamentGames())
                                            resetGameForApi()
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