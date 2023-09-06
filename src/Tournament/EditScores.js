import { useContext } from "react"
import { TournamentContext } from "./TournamentProvider"
import { alterGame } from "../ServerManager"
import trophyIcon from "../images/small_trophy_with_background.png"


export const EditScores = ({ allPlayersArr, handleGameForApiUpdate, setEditScores, gameForApi }) => {
    const { tournamentGames, resetTournamentGames, findIdentifier, clubPlayers, clubGuests } = useContext(TournamentContext)
    const sortedTournamentGames = tournamentGames.sort((a, b) => { return a.id - b.id })
    return (
        <section id="tournamentEditSection">

            {/* <button className="buttonStyleReject" id="cancelEditBtn" onClick={() => setEditScores(false)}>cancel edit</button> */}
            <section id="previousMatchups">
                {
                    sortedTournamentGames.map(game => {
                        const whiteIdentifier = findIdentifier(game.player_w)
                        // const isWhiteGuest = isNaN(parseInt(whiteIdentifier)) ? true : false
                        const blackIdentifier = findIdentifier(game?.player_b)
                        // const isBlackGuest = isNaN(parseInt(blackIdentifier)) ? true : false
                        // const winnerIdentifier = findIdentifier(game?.winner)

                        // const white = allPlayersArr.find(player => {
                        //     if (game.player_w.guest_id) {
                        //         return player.guest_id === game.player_w.guest_id
                        //     }
                        //     else {
                        //         return player.id === game.player_w.id
                        //     }
                        // })
                        // const black = allPlayersArr.find(player => {
                        //     if (game.player_b?.guest_id) {
                        //         return player.guest_id === game.player_b?.guest_id
                        //     }
                        //     else {
                        //         return player.id === game.player_b?.id
                        //     }
                        // })
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
                        // let white = {}
                        // let black = {}
                        // if (isWhiteGuest === true) {
                        //     white = allPlayersArr.find(player => player.guest_id === whiteIdentifier)
                        // }
                        // else{
                        //     white = allPlayersArr.find(player => player.id === whiteIdentifier)
                        // }
                        // if (isBlackGuest === true) {
                        //     black = allPlayersArr.find(player => player.guest_id === blackIdentifier)
                        // }
                        // else{
                        //     black = allPlayersArr.find(player => player.id === blackIdentifier)
                        // }
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
                                            }}>{black?.full_name} </div>
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