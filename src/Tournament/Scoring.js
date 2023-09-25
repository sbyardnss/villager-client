import { useContext } from "react"
import { TournamentContext } from "./TournamentProvider"
import { sendNewGame } from "../ServerManager"

export const Scoring = ({activeTournament, activeTournamentPlayers, handleGameForApiUpdate, resetGameForApi, currentRoundMatchups, playerOpponentsReferenceObj, gameForApi, currentRound}) => {
    /*currentroundmatchups
    activeTournamentPlayers
    activeTournament
    handleGameForApiUpdate
    tournamentGames
    resetGameForApi
    resetTournamentGames
    */
    const { tournamentGames, resetTournamentGames } = useContext(TournamentContext)
    const byeMatchup = currentRoundMatchups?.find(matchup => matchup.player1 === null || matchup.player2 === null)
    const whiteBye = activeTournamentPlayers?.find(player => player.id === byeMatchup?.player1 || player.guest_id === byeMatchup?.player1)
    if (activeTournament?.complete === false) {
        if (activeTournament?.in_person === true) {
            // const blackBye = activeTournamentPlayers?.find(player => player.id === byeMatchup.player2 || player.guest_id === byeMatchup.player2)
            return (
                <section id="tournamentScoringSection">
                    {byeMatchup ?
                        <div key={`${byeMatchup.round} -- ${byeMatchup.match} -- bye`} className="setColor setCustomFont">
                            {whiteBye?.full_name} has bye
                        </div>
                        : ""}
                    {/* {(tournamentGames.filter(g => g.tournament_round === currentRound).length === currentRoundMatchups.length) || (tournamentGames.filter(g => g.tournament_round === currentRound).length === currentRoundMatchups.length-1 && byeMatchup) ? <div className="setCustomFont">all games played. start new round</div>: ""} */}

                    {
                        currentRoundMatchups?.map((matchup, index) => {
                            const white = activeTournamentPlayers?.find(player => player.id === matchup.player1 || player.guest_id === matchup.player1)
                            const black = activeTournamentPlayers?.find(player => player.id === matchup.player2 || player.guest_id === matchup.player2)
                            const whiteTargetForIndicator = white?.guest_id ? white?.guest_id : white?.id
                            const blackTargetForIndicator = black?.guest_id ? black?.guest_id : black?.id
                            const matchingGame = tournamentGames.find(tg => {
                                const gamePlayerWIndicator = tg.player_w.guest_id ? tg.player_w.guest_id : tg.player_w.id
                                let gamePlayerBIndicator = 0
                                if (tg.player_b === null) {
                                    gamePlayerBIndicator = null
                                }
                                else {
                                    tg.player_b.guest_id ? gamePlayerBIndicator = tg.player_b.guest_id : gamePlayerBIndicator = tg.player_b.id
                                }
                                return tg.tournament_round === currentRound && gamePlayerBIndicator === blackTargetForIndicator && gamePlayerWIndicator === whiteTargetForIndicator
                            })

                            if (black !== undefined && white !== undefined && !matchingGame?.winner && matchingGame?.win_style !== 'draw' && playerOpponentsReferenceObj[whiteTargetForIndicator]?.indexOf(blackTargetForIndicator) !== playerOpponentsReferenceObj[whiteTargetForIndicator]?.length + 1) {
                                return (
                                    <div key={`${matchup.round} -- ${matchup.match} -- ${index}`}
                                        className="tournamentScoringMatchup">
                                        <div
                                            className={gameForApi.id === undefined && gameForApi.winner === whiteTargetForIndicator ? "selectedWhitePiecesMatchup" : "whitePiecesMatchup"}
                                            id="whitePieces"
                                            onClick={(evt) => {
                                                handleGameForApiUpdate(evt.target.id, white, black)
                                            }}>{white?.full_name}
                                            {/* }}>{white?.guest_id ? white.full_name : white?.username} */}
                                        </div>
                                        <div
                                            className={gameForApi.id === undefined && gameForApi.player_w === whiteTargetForIndicator && gameForApi.player_b === blackTargetForIndicator && gameForApi.win_style === "draw" ? "selectedDrawMatchupButton" : "drawMatchupButton"}
                                            id="drawUpdate"
                                            onClick={(evt) => {
                                                handleGameForApiUpdate(evt.target.id, white, black)
                                            }}>Draw
                                        </div>
                                        <div
                                            className={gameForApi.id === undefined && gameForApi.winner === blackTargetForIndicator ? "selectedBlackPiecesMatchup" : "blackPiecesMatchup"}
                                            id="blackPieces"
                                            onClick={(evt) => {
                                                handleGameForApiUpdate(evt.target.id, white, black)
                                                // }}>{black?.guest_id ? black.full_name : black?.username}
                                            }}>{black.full_name}
                                        </div>
                                        <button
                                            id="scoringSubmit"
                                            className="buttonStyleReject"
                                            onClick={() => {
                                                if (gameForApi.winner !== 0) {
                                                    sendNewGame(gameForApi)
                                                        .then(() => resetTournamentGames())
                                                    resetGameForApi()
                                                }
                                            }}>
                                            submit
                                        </button>
                                    </div>
                                )
                            }
                        })
                    }
                </section>
            )
            return (
                <section>

                </section>
            )
        }
    }
}