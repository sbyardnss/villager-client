import { useContext } from "react"
import { TournamentContext } from "./TournamentProvider"


export const ActiveTournament = ({ props }) => {
    const {activeTournament, activeTournamentPlayers, timeSettings, tournamentGames, selectedTournament, setSelectedTournament, resetTournamentGames } = useContext(TournamentContext)
    const [currentRound, setCurrentRound] = useState(0)
    const [scoring, setScoring] = useState(true)
    const [editScores, setEditScores] = useState(false)
    const [resultsForTieBreak, updateResultsForTieBreak] = useState([])

    if (selectedTournament) {
        const scoringButtonOrNone = () => {
            if (activeTournament.in_person === false) {
                return (
                    <button onClick={() => {
                        {
                            currentRoundMatchups.map(matchup => {
                                if (matchup.player2 !== null) {
                                    const copy = { ...gameForApi }
                                    copy.winner = null
                                    copy.player_w = matchup.player1
                                    copy.player_b = matchup.player2
                                    sendNewGame(copy)
                                }
                                else {
                                    const copy = { ...gameForApi }
                                    copy.winner = null
                                    copy.player_w = matchup.player1
                                    copy.player_b = null
                                    sendNewGame(copy)
                                }
                            })
                        }
                    }}>create round games</button>
                )
            }
            else {
                return (
                    <button onClick={() => {
                        setScoring(true)
                        setEditScores(false)
                    }}>score</button>
                )
            }
        }
        if (activeTournament && activeTournamentPlayers) {
            const modal = document.getElementById('finishTournamentModal')
            //current method for displaying results. delete when new useEffect is working
            const resultsDisplay = () => {
                const results = {}
                const resultArr = []
                const arrForTieBreakers = []
                activeTournamentPlayers.map(player => {
                    const scoreElement = document.getElementById(player.id + "-- score")
                    results[player.username] = [parseFloat(scoreElement?.innerHTML), player.id]
                })
                for (let player in results) {
                    resultArr.push([player, results[player]])
                }
                resultArr.sort((a, b) => { return b[1][0] - a[1][0] })
                return (
                    <section id="fullResults" className="setCustomFont">
                        <div id="standardResults" >
                            <div className="resultsHeader">standard</div>
                            {
                                resultArr.map(r => {
                                    arrForTieBreakers.push(r[1][1])
                                    return (
                                        <div key={r[0]} className="resultsModalListItem">
                                            <div>{r[0]}: </div>
                                            <div>{r[1][0].toString()}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div id="tieBreakResults">
                            <div id="solkoffResults">
                                <div className="resultsHeader">solkoff</div>
                                {
                                    arrForTieBreakers.map(r => {
                                        const player = activeTournamentPlayers.find(p => p.id === r)
                                        // console.log(activeTournamentPlayers)
                                        return (
                                            <div key={'playerId' + r} className="resultsModalListItem">
                                                <div>{player?.username}: </div>
                                                <div>{solkoffTieBreaker([r]).toString()}</div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div id="cumulativeResults">
                                <div className="resultsHeader">cumulative</div>
                                {
                                    arrForTieBreakers.map(r => {
                                        const player = activeTournamentPlayers.find(p => p.id === r)
                                        // console.log(activeTournamentPlayers)
                                        return (
                                            <div key={'playerId' + r} className="resultsModalListItem">
                                                <div>{player?.username}: </div>
                                                <div>{cumulativeTieBreaker([r]).toString()}</div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </section>
                )
            }
            return <>
                <main id="tournamentContainer">
                    <div id="finishTournamentModal">
                        Results
                        {resultsDisplay()}
                        {/* <div id="modalResults">
                        </div> */}
                        <div id="modalBtns">
                            <button>End Tournament</button>
                            <button onClick={() => {
                                modal.style.display = "none"
                            }}>cancel</button>
                        </div>
                    </div>
                    <div className="setColor setTournamentFontSize">{activeTournament.title}</div>
                    <div id="tournamentProgressionControls">
                        <button
                            className="progressionControlBtn"
                            onClick={() => {
                                if (window.confirm("create round?")) {
                                    if (byePlayer) {
                                        sendNewGame(byeGame)
                                    }
                                    const tournamentCopy = { ...activeTournament }
                                    tournamentCopy.rounds++
                                    updateTournament(tournamentCopy)
                                        .then(() => {
                                            resetTournaments()
                                            resetTournamentGames()
                                        })
                                }
                            }}>Finish Round</button>
                        <button
                            className="progressionControlBtn"
                            onClick={() => {
                                setSelectedTournament(0)
                                setEditScores(false)
                                setScoring(false)
                            }}>exit</button>
                        <button
                            className="progressionControlBtn"
                            onClick={() => {
                                setEditScores(true)
                                setScoring(false)
                            }}>edit scores</button>
                        {scoringButtonOrNone()}
                        <button
                            className="progressionControlBtn"
                            onClick={() => {
                                modal.style.display = "flex";
                            }}>Results</button>
                    </div>
                    <div className="setColor setTournamentFontSize">
                        Round {currentRound}
                    </div>
                    <section id="matchupsContainer">
                        {/* {matchupsOrScoring()} */}
                        {submitResultsOrNull()}
                    </section>
                    <section id="tournamentTableContainer">
                        <table id="tournamentTable">
                            <thead>
                                <tr key={0} className="tableHeaderRow">
                                    <th>player</th>
                                    {
                                        roundHtml.map(round => {
                                            return round
                                        })
                                    }
                                    <th>count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    activeTournamentPlayers.map(tourneyPlayer => {
                                        const tourneyPlayerGames = tournamentGames.filter(tg => {
                                            return tg.player_b?.id === tourneyPlayer.id || tg.player_w.id === tourneyPlayer.id
                                        })
                                        const emptyCellCompensation = () => {
                                            if (tourneyPlayerGames.length < currentRound) {
                                                return (
                                                    <td></td>
                                                )
                                            }
                                        }
                                        let score = 0
                                        return (
                                            <tr key={tourneyPlayer.id} id={tourneyPlayer.id + "--tourneyRow"}>
                                                <td key={tourneyPlayer.id} className="tablePlayerCell">{tourneyPlayer.full_name}</td>
                                                {
                                                    tourneyPlayerGames.map(tpg => {
                                                        // if (tpg.player_b?.id === 3 || tpg.player_w?.id === 3) {
                                                        //     console.log(tpg)
                                                        // }
                                                        if (tpg.bye === true) {
                                                            score++
                                                            return (
                                                                <td key={tpg.id} value={1} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResultBye">bye</td>
                                                            )
                                                        }
                                                        if (tpg.winner?.id === tourneyPlayer.id) {
                                                            score++
                                                            return (
                                                                <td key={tpg.id} value={1} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">1</td>
                                                            )
                                                        }
                                                        else if (tpg.winner === null && tpg.win_style === "draw") {
                                                            score += .5
                                                            return (
                                                                <td key={tpg.id} value={.5} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">1/2</td>
                                                            )
                                                        }
                                                        else if (tpg.winner === null && !tpg.win_style) {
                                                            score = score
                                                            return (
                                                                <td key={tpg.id} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult"></td>
                                                            )
                                                        }
                                                        else {
                                                            score = score
                                                            return (
                                                                <td key={tpg.id} value={0} id={tpg.id + "--" + tourneyPlayer.id} className="tournamentGameResult">0</td>
                                                            )
                                                        }
                                                    })
                                                }
                                                {emptyCellCompensation()}
                                                <td key={tourneyPlayer.id + "-- score"} id={tourneyPlayer.id + "-- score"} value={score || "0"}>
                                                    {score}
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </section>
                    {tableOrEdit()}
                </main>
            </>
        }
    }
}